import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import api from '../lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string; 
  role: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer' | 'event_manager' | 'event_admin' | 'client' | 'studio_manager' | 'judge';
  roles?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  supabase: ReturnType<typeof createClient> | null;
  updateAuthUser: (updates: {email?: string, name?: string, avatar?: string, role?: string}) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>; 
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  updateUserProfile: (profileData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Only initialize Supabase if we have valid URL and key (not placeholder values)
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    supabaseUrl.startsWith('https://')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true, 
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error.message);
    console.error("Error details:", error);
  }
} else {
  console.warn('⚠️ Supabase not configured properly. Using mock data.');
  console.error("Please update your .env file with actual Supabase credentials from your Supabase project dashboard");
  supabase = null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null); 
  const [isLoading, setIsLoading] = useState(true);

  // Function to update user profile data in the context
  function updateUserProfile(profileData: Partial<AuthUser>) {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...profileData };
    });
  }

  // Function to fetch user data from our database
  const fetchUserData = async (userId: string, userEmail: string) => {
    try {
      console.log('🔍 Fetching user data for:', userEmail);
      console.log('🔍 User ID:', userId);
      let userData: any = null;
      
      // Use Supabase directly to get user data
      if (supabase) {
        console.log('📊 Querying database for user data with ID:', userId);
        
        // Query user data with proper error handling
        const { data, error, status } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('❌ Error fetching user data from Supabase:', error, 'Status:', status);
          
          // Check if user doesn't exist in database yet
          if (error.code === 'PGRST116' || error.message?.includes('No rows returned')) {
            console.log('📝 User not found in database, creating new user record...');
            
            // Create user record in database
            const newUserData = {
              id: userId,
              name: userEmail?.split('@')[0] || 'User',
              email: userEmail || '',
              role: 'artist',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: insertData, error: insertError } = await supabase
              .from('users')
              .insert([newUserData])
              .select()
              .single();
              
            if (insertError) {
              console.error('❌ Error creating user record:', insertError);
              // Return fallback data if insert fails
              return {
                id: userId,
                name: userEmail?.split('@')[0] || 'User',
                email: userEmail || '',
                role: 'artist' as const,
                roles: ['artist']
              };
            }
            
            console.log('✅ User record created successfully:', insertData);
            userData = insertData;
          } else {
            // For other errors, log and use fallback
            console.error('❌ Database error:', error);
            return {
              id: userId,
              name: userEmail?.split('@')[0] || 'User',
              email: userEmail || '',
              role: 'artist' as const,
              roles: ['artist']
            };
          }
        } else if (data && Object.keys(data).length > 0) {
          userData = data;
          console.log('✅ DATABASE READ CONFIRMED - User data retrieved from database:', {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            created_at: userData.created_at
          });
        } else {
          console.warn('⚠️ DATABASE READ FAILED - No user data found in database for ID:', userId);
          console.log('Supabase query returned empty data:', data);
        }
      }

      if (!userData) {
        // Fallback to basic user info
        console.log('⚠️ DATABASE READ FAILED - Using fallback user data');
        return {
          id: userId,
          name: userEmail?.split('@')[0] || 'User',
          email: userEmail || '',
          role: 'artist' as const,
          roles: ['artist']
        };
      }
      
      return userData;
    } catch (error: any) {
      console.error('❌ Error fetching user data:', error);
      
      // Fallback to basic user info if API call fails
      return {
        id: userId,
        name: userEmail?.split('@')[0] || 'User',
        email: userEmail || '',
        role: 'artist' as const,
        roles: ['artist']
      };
    }
  };

  // Function to update user state with complete data
  const updateUserState = async (session: Session | null) => {
    if (session?.user) {
      console.log('🔄 Updating user state for:', session.user.email || 'unknown email', 'User ID:', session.user.id, 'at', new Date().toISOString());
      
      // Set user immediately with basic information from session
      const userMetadata = session.user.user_metadata || {};
      const initialUser: AuthUser = {
        id: session.user.id,
        name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: userMetadata.role || 'artist', 
        roles: userMetadata.roles || [userMetadata.role || 'artist'],
        avatar: undefined
      };
      
      console.log('🔄 Setting initial user state at:', new Date().toISOString());
      setUser(initialUser);
      setIsLoading(false);
      
      // Set the authorization header for API requests
      if (session?.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      // Now fetch complete user data from database
      try {
        console.log('🔍 Fetching complete user data from database...');
        
        const userData = await fetchUserData(session.user.id, session.user.email || '');
        
        // Only update if we got valid data from database
        if (userData && userData.id) {
          const userObj: AuthUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email || session.user.email || '',
            role: userData.role || 'artist', 
            roles: userData.roles || [userData.role || 'artist'],
            avatar: undefined
          };
          
          console.log('✅ DATABASE READ CONFIRMED - Setting user state with database data:', {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
          
          setUser(userObj);
          console.log('✅ User state updated with database data at:', new Date().toISOString());
        } else {
          console.warn('⚠️ DATABASE READ FAILED - No valid user data returned, keeping basic info');
        }
      } catch (error: any) {
        if (error.message === 'NETWORK_ERROR') {
          console.warn('🌐 Network connectivity issue - continuing with basic user info');
        } else if (error.message === 'TIMEOUT_ERROR') {
          console.warn('⏱️ Database query timeout - continuing with basic user info');
        } else {
          console.error('❌ Error updating user state with database data:', error.message);
        }
        console.log('⚠️ Continuing with basic user info from session');
      }
    } else {
      setUser(null);
      // Clear authorization header when no user
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase not configured. Please check your environment variables.');
      console.warn('💡 To fix this:');
      console.warn('   1. Check your .env file exists and has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      console.warn('   2. Restart your development server after updating .env');
      console.warn('   3. Verify your Supabase project is active at supabase.com');
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      console.log('Initial session check:', session?.user?.email || 'No session');
      
      if (session?.access_token) {
        // Set the authorization header for API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      try {
        await updateUserState(session);
      } catch (error) {
        console.error('❌ Error during initial user state update:', error);
        // Continue anyway - user can still use the app with basic session info
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);

      // Important: Only update if the session actually changed
      if (JSON.stringify(session) === JSON.stringify(newSession)) {
        console.log('Session unchanged, skipping update');
        return;
      }
      
      console.log('Setting new session state');
      setSession(newSession);
      if (newSession?.access_token) {
        // Set the authorization header for API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newSession.access_token}`;
      } else {
        // Clear authorization header when no session
        delete api.defaults.headers.common['Authorization'];
        // Clear user state
        setUser(null);
      }
      
      try {
        await updateUserState(newSession);
      } catch (error) {
        console.error('❌ Error during auth state change user update:', error);
        // Continue anyway - user can still use the app
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }
    
    setIsLoading(true);
    console.log('Starting login process for:', email);
    console.log('⏱️ Login attempt started at:', new Date().toISOString());
    
    try {
      console.log('Authenticating with Supabase for:', email);
      
      // Perform the login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        throw error;
      }

      console.log('✅ Login successful for:', email);
      console.log('✅ Session obtained at:', new Date().toISOString());
      
      // Set session immediately
      setSession(data.session);
      
      // Set user immediately with basic info to prevent hanging
      const userMetadata = data.user?.user_metadata || {};
      const tempUser = {
        id: data.user?.id || '',
        name: userMetadata.name || data.user?.email?.split('@')[0] || 'User',
        email: data.user?.email || '',
        role: userMetadata.role || 'artist',
        roles: [userMetadata.role || 'artist']
      };
      setUser(tempUser);
      
      // Then update user state with complete data
      try {
        await updateUserState(data.session);
      } catch (error) {
        console.warn('⚠️ Could not fetch extended user data, but login succeeded:', error);
        // Continue with login even if user state update fails
      }
      
      console.log('✅ Login process completed successfully at:', new Date().toISOString());
      
      // Force navigation to dashboard immediately
      setTimeout(() => {
        console.log('🔄 Forcing navigation to dashboard');
        if (window.location.pathname !== '/dashboard') {
          console.log('🧭 Redirecting to dashboard...');
          window.location.href = '/dashboard';
        } else {
          console.log('🏠 Already on dashboard page');
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Error during login:', error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase) {
      console.error('Supabase not configured');
      setUser(null);
      setSession(null);
      return;
    }

    setIsLoading(true);
    console.log('Starting logout process');
    try {
      // Clear user state immediately for responsive UI
      setUser(null);
      setSession(null);
      
      // Clear authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Then perform the actual signout
      const { error } = await supabase.auth.signOut({
        scope: 'global'  // Sign out from all tabs/devices
      });
      
      if (error) {
        console.error('Logout error:', error);
        setIsLoading(false);
        throw error;
      }

      console.log('User logged out successfully');
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('Logout process completed');
    }
  };

  // Function to update user auth data (email, metadata, etc)
  const updateAuthUser = async (updates: {email?: string, name?: string, avatar?: string, role?: string}) => {
    if (!supabase || !user) {
      console.error('❌ Supabase not configured or user not logged in');
      throw new Error('Authentication service not configured or user not logged in');
    }

    try {
      // Prepare update data for auth
      const authUpdates: any = {};
      const metadataUpdates: any = {};
      
      // Add email if provided
      if (updates.email) {
        authUpdates.email = updates.email;
      }
      
      // Add name to metadata if provided
      if (updates.name) {
        metadataUpdates.name = updates.name;
      }
      
      // Add role to metadata if provided
      if (updates.role) {
        metadataUpdates.role = updates.role;
      }
      
      // Only update metadata if there are changes
      if (Object.keys(metadataUpdates).length > 0) {
        authUpdates.data = metadataUpdates;
      }
      
      // Only proceed if there are updates to make
      if (Object.keys(authUpdates).length === 0) {
        console.log('No auth updates to make');
        return;
      }
      
      console.log('Updating user auth data:', authUpdates);
      
      // Update in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser(authUpdates);

      if (authError) {
        throw authError;
      }

      // Prepare database updates
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.email) {
        dbUpdates.email = updates.email;
      }
      
      if (updates.name) {
        dbUpdates.name = updates.name;
      }
      
      if (updates.role) {
        dbUpdates.role = updates.role;
      }
      
      // Update in users table
      const { error: dbError } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (dbError) {
        throw dbError;
      }

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = { ...prev };
        
        if (updates.email) updatedUser.email = updates.email;
        if (updates.name) updatedUser.name = updates.name;
        if (updates.role) updatedUser.role = updates.role as any;
        if (updates.avatar) updatedUser.avatar = updates.avatar;
        
        return updatedUser;
      });
      
      console.log('✅ User auth data updated successfully');

      return true;
    } catch (error) {
      console.error('❌ Error updating user auth data:', error);
      throw new Error('Failed to update user information. Please try again.');
    }
  };

  // Function to update user roles
  const updateUserRoles = async (roles: string[], primaryRole: string) => {
    if (!supabase || !user) {
      console.error('Supabase not configured or user not logged in');
      throw new Error('Supabase not configured or user not logged in');
    }
    
    console.log('Updating user roles:', roles, 'primary:', primaryRole);

    try {
      // Call the set_primary_role function
      const { error: primaryRoleError } = await supabase.rpc('set_primary_role', {
        user_uuid: user.id,
        primary_role: primaryRole
      });

      if (primaryRoleError) {
        throw primaryRoleError;
      }

      // Add all roles
      // First, get current roles
      const { data: currentRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      const existingRoles = currentRoles?.map(r => r.role) || [];
      console.log('Existing roles:', existingRoles);
      
      // Remove roles that are no longer needed
      for (const existingRole of existingRoles) {
        if (!roles.includes(existingRole) && existingRole !== primaryRole) {
          console.log('Removing role:', existingRole);
          const { error: removeRoleError } = await supabase.rpc('remove_user_role', {
            user_uuid: user.id,
            role_to_remove: existingRole
          });
          
          if (removeRoleError) {
            console.error(`Error removing role ${existingRole}:`, removeRoleError);
          }
        }
      }
      
      // Add new roles
      for (const role of roles) {
        if (!existingRoles.includes(role)) {
          console.log('Adding role:', role);
          const { error: addRoleError } = await supabase.rpc('add_user_role', {
            user_uuid: user.id,
            new_role: role
          });

          if (addRoleError) {
            console.error(`Error adding role ${role}:`, addRoleError);
          }
        }
      }

      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        role: primaryRole as any, 
        roles: roles
      } : null);

      return true;
    } catch (error) {
      console.error('Error updating roles:', error);
      throw error;
    }
  };

  // Function to update user password (admin only)
  const updateUserPassword = async (userId: string, newPassword: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can update user passwords');
    }
    
    try {
      const response = await api.patch(`/users/${userId}/password`, { 
        newPassword 
      }, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to update user password');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      session,
      supabase,
      login,
      logout,
      isLoading,
      updateAuthUser,
      updateUserRoles,
      updateUserPassword,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}