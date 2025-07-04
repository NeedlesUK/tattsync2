import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import axios from 'axios';

interface AuthUser {
  id: string;
  name: string;
  email: string; 
  role: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer' | 'event_manager' | 'event_admin' | 'client' | 'studio_manager' | 'judge';
  roles?: { role: string; is_primary: boolean }[];
  roles?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  isLoading: boolean;
  supabase: ReturnType<typeof createClient> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

// Only initialize Supabase if we have valid URL and key (not placeholder values)
if (supabaseUrl) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
}

// Create admin client for direct database access
const supabaseAdmin = supabase;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<{ role: string; is_primary: boolean }[]>([]);

  // Function to fetch user data from our database
  const fetchUserData = async (userId: string, userEmail: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId, userEmail);
      
      // Special case for gary@tattscore.com - always admin
      if (userEmail === 'gary@tattscore.com' || userEmail === 'admin@tattsync.com') {
        console.log('👑 Setting admin role for gary@tattscore.com');
        return {
          id: userId,
          name: 'Gary Watts',
          email: 'gary@tattscore.com',
          role: 'admin',
          roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge']
        };
      }
      
      // Try direct database query first
      if (supabase) {
        try {
          console.log('🔍 Querying Supabase for user data');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', userId)
            .single();
          
          if (userError) {
            console.error('❌ Error fetching user data from Supabase:', userError);
            throw userError;
          }
          
          // Fetch user roles
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);
            
          if (rolesError) {
            console.error('❌ Error fetching user roles from Supabase:', rolesError);
          }
          
          const roles = rolesData ? rolesData.map(r => r.role) : [userData.role];
          
          console.log('✅ User data from Supabase:', userData);
          console.log('✅ User roles from Supabase:', roles);
          
          const result = {
            ...userData,
            roles
          };
          
          console.log('Returning user data:', result);
          return result;
        } catch (error) {
          console.error('❌ Error fetching user data from Supabase:', error);
          // Fall through to the fallback
        }
      } else if (session?.access_token) {
        try {
          console.log('🔍 Fetching user data from API');
          const response = await axios.get(`/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          console.log('✅ User data from API:', response.data);
          return response.data;
        } catch (error) {
          console.error('❌ Error fetching user data from API:', error);
          // Fall through to the fallback
        }
      }
      
      // Fallback to basic user info
      console.log('⚠️ Using fallback user data');
      
      // Special case for gary@tattscore.com - always admin
      if (userEmail === 'gary@tattscore.com') {
        return {
          id: userId,
          name: 'Gary Watts',
          email: 'gary@tattscore.com',
          role: 'admin',
          roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge']
        };
      }
      
      return {
        id: userId,
        name: userEmail?.split('@')[0] || 'User',
        email: userEmail || '',
        role: 'artist' as const,
        roles: ['artist']
      };
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // Fallback to basic user info if API call fails
      
      // Special case for gary@tattscore.com - always admin
      if (userEmail === 'gary@tattscore.com' || userEmail === 'admin@tattsync.com') {
        return {
          id: userId,
          name: 'Gary Watts',
          email: 'gary@tattscore.com',
          role: 'admin',
          roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge']
        };
      }
      
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
      console.log('🔄 Updating user state for session:', session.user.email);
      try {
        // Special case for gary@tattscore.com - always admin
        if (session.user.email === 'gary@tattscore.com' || session.user.email === 'admin@tattsync.com') {
          console.log('👑 Setting admin user for gary@tattscore.com');
          setUser({
            id: session.user.id,
            name: 'Gary Watts',
            email: 'gary@tattscore.com',
            role: 'admin',
            roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge'],
            avatar: undefined
          });
          return;
        }
        
        const userData = await fetchUserData(session.user.id, session.user.email || '');
        
        // Fetch user roles if supabase is available
        if (supabase) {
          try {
            const { data: rolesData, error: rolesError } = await supabase
              .rpc('get_user_roles', { user_uuid: session.user.id });
            
            if (!rolesError && rolesData) {
              setUserRoles(rolesData);
            }
          } catch (error) {
            console.error('Error fetching user roles:', error);
          }
        }
        console.log('✅ Setting user state with data:', userData);

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || session.user.user_metadata?.role || 'artist', 
          roles: userData.roles || [userData.role || session.user.user_metadata?.role || 'artist'],
          avatar: undefined
        });
      } catch (error) {
        console.error('❌ Error updating user state:', error);
            roles: userRoles,
        
        // Special case for gary@tattscore.com - always admin
        if (session.user.email === 'gary@tattscore.com' || session.user.email === 'admin@tattsync.com') {
          console.log('👑 Setting admin user for gary@tattscore.com (fallback)');
          setUser({
            id: session.user.id,
            name: 'Gary Watts',
            email: 'gary@tattscore.com',
            role: 'admin',
            roles: userRoles,
            roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge'],
            avatar: undefined
          });
          return;
        }
        
        // Fallback to basic user info from session
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'artist',
          roles: userRoles,
          roles: [session.user.user_metadata?.role || 'artist']
        });
      }
    } else {
      setUser(null);
      setUserRoles([]);
      // Clear authorization header when no user
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      console.log('🔍 Initial session check:', session?.user?.email);
      
      if (session?.access_token) {
        // Set the authorization header for API requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      await updateUserState(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', session?.user?.email);
      setSession(session);
      
      if (session?.access_token) {
        // Set the authorization header for API requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        // Clear authorization header when no session
        delete axios.defaults.headers.common['Authorization'];
      }
      
      await updateUserState(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Set authorization header immediately after successful login
      if (data.session?.access_token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.session.access_token}`;
      }

      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // Clear authorization header
      delete axios.defaults.headers.common['Authorization'];
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Function to update user email
  const updateUserEmail = async (newEmail: string) => {
    if (!supabase || !user) {
      throw new Error('Supabase not configured or user not logged in');
    }

    try {
      // Update email in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (authError) {
        throw authError;
      }

      // Update email in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ email: newEmail, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (dbError) {
        throw dbError;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, email: newEmail } : null);

      return true;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  };

  // Function to update user roles
  const updateUserRoles = async (roles: string[], primaryRole: string) => {
    if (!supabase || !user) {
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      logout, 
      isLoading, 
      updateUserEmail,
      updateUserRoles,
      supabase
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