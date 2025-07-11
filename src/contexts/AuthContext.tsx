import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  supabase: SupabaseClient | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAuthUser: (updates: Partial<AuthUser>) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase client
  useEffect(() => {
    console.log('Initializing Supabase client...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found in environment variables');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      
      console.log('Checking for existing session...');
      
      // Check for existing session
      supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          try {
            const userData = await fetchUserData(supabaseClient, session.user.id);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Set basic user data from session
            const userMetadata = session.user.user_metadata || {};
            setUser({
              id: session.user.id,
              name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: userMetadata.role || 'artist',
              roles: userMetadata.roles || [userMetadata.role || 'artist']
            });
          }
        }
        
        setIsLoading(false);
      });
      
      // Set up auth state change listener
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session) {
            console.log('User signed in, fetching user data...');
            try {
              const userData = await fetchUserData(supabaseClient, session.user.id);
              setUser(userData);
            } catch (error) {
              console.error('Error fetching user data on auth change:', error);
              // Set basic user data from session
              const userMetadata = session.user.user_metadata || {};
              setUser({
                id: session.user.id,
                name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: userMetadata.role || 'artist',
                roles: userMetadata.roles || [userMetadata.role || 'artist']
              });
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setIsLoading(false);
    }
  }, []);

  // Fetch user data from database
  const fetchUserData = async (supabaseClient: SupabaseClient, userId: string): Promise<AuthUser> => {
    console.log('Fetching user data for ID:', userId);
    
    // Add timeout protection for database queries
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    );
    
    try {
      // Try to get user from database
      const { data: userData, error } = await Promise.race([
        supabaseClient
          .from('users')
          .select('id, name, email, role')
          .eq('id', userId)
          .single(),
        timeoutPromise
      ]);
      
      if (error) {
        console.error('Error fetching user from database:', error);
        throw error;
      }
      
      if (!userData) {
        throw new Error('User not found in database');
      }
      
      // Try to get user roles
      let roles = [userData.role];
      try {
        const { data: rolesData } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
          
        if (rolesData && rolesData.length > 0) {
          roles = rolesData.map(r => r.role);
        }
      } catch (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }
      
      // Try to get user profile for avatar
      let avatar = undefined;
      try {
        const { data: profileData } = await supabaseClient
          .from('user_profiles')
          .select('profile_picture')
          .eq('user_id', userId)
          .single();
          
        if (profileData && profileData.profile_picture) {
          avatar = profileData.profile_picture;
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
      
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        roles,
        avatar
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      
      // Fallback to getting basic user info from auth
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      
      if (!authUser) {
        throw new Error('User not found in auth');
      }
      
      const userMetadata = authUser.user_metadata || {};
      
      return {
        id: authUser.id,
        name: userMetadata.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: userMetadata.role || 'artist',
        roles: userMetadata.roles || [userMetadata.role || 'artist']
      };
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    console.log(`Attempting login for: ${email}`);
    console.log('⏱️ Login attempt timestamp:', new Date().toISOString());
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('✅ Login successful at:', new Date().toISOString());
      
      if (data.session?.user) {
        // Set user immediately after login success
        const userMetadata = data.session.user.user_metadata || {};
        const initialUser = {
          id: data.session.user.id,
          name: userMetadata.name || data.session.user.email?.split('@')[0] || 'User',
          email: data.session.user.email || '',
          role: userMetadata.role || 'artist', 
          roles: userMetadata.roles || [userMetadata.role || 'artist']
        };
        
        console.log('🔄 Setting user state at:', new Date().toISOString());
        setUser(initialUser);
        
        // Force navigation after setting user state
        setTimeout(() => {
          console.log('🧭 Navigation triggered at:', new Date().toISOString());
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      console.error('Error in login function:', error);
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'artist'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create user record in database
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: 'artist'
            }
          ]);
          
        if (dbError) {
          console.error('Error creating user record:', dbError);
          // Continue anyway, as the auth user was created
        }
      }
    } catch (error) {
      console.error('Error in register function:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error in logout function:', error);
      throw error;
    }
  };

  // Update user function
  const updateAuthUser = async (updates: Partial<AuthUser>) => {
    if (!supabase || !user) {
      throw new Error('Supabase client not initialized or user not logged in');
    }
    
    try {
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          role: updates.role
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // Update user record in database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (dbError) {
        throw dbError;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Update user roles function
  const updateUserRoles = async (roles: string[], primaryRole: string) => {
    if (!supabase || !user) {
      throw new Error('Supabase client not initialized or user not logged in');
    }
    
    try {
      // Update primary role in users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          role: primaryRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (userError) {
        throw userError;
      }
      
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new roles
      const rolesToInsert = roles.map(role => ({
        user_id: user.id,
        role,
        is_primary: role === primaryRole
      }));
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(rolesToInsert);
        
      if (insertError) {
        throw insertError;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, role: primaryRole, roles } : null);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabase,
        isLoading,
        login,
        register,
        logout,
        updateAuthUser,
        updateUserRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};