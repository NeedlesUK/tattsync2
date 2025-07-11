import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define the User type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  avatar?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  supabase: SupabaseClient | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateAuthUser: (updates: Partial<User>) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  supabase: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateAuthUser: async () => {},
  updateUserRoles: async () => {},
  updateUserPassword: async () => {},
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  
  // Initialize Supabase client
  useEffect(() => {
    console.log('Initializing Supabase client...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      
      // Check for existing session
      console.log('Checking for existing session...');
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('Found existing session, fetching user data...');
          fetchUserData(supabaseClient, session.user.id)
            .then(userData => {
              if (userData) {
                setUser(userData);
              }
            })
            .catch(error => {
              console.error('Error fetching user data:', error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          console.log('No existing session found');
          setIsLoading(false);
        }
      });
      
      // Set up auth state change listener
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session) {
            console.log('User signed in, fetching user data...');
            try {
              const userData = await fetchUserData(supabaseClient, session.user.id);
              if (userData) {
                console.log('User data fetched successfully:', userData);
                setUser(userData);
              }
            } catch (error) {
              console.error('Error fetching user data after sign in:', error);
            } finally {
              setIsLoading(false);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
            setIsLoading(false);
          }
        }
      );
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        console.log('Safety timeout reached - forcing loading state to false');
        setIsLoading(false);
      }, 5000);
      
      // Clean up subscription and timeout on unmount
      return () => {
        subscription.unsubscribe();
        clearTimeout(safetyTimeout);
      };
    } else {
      console.error('Supabase credentials not found in environment variables');
      setIsLoading(false);
    }
  }, []);
  
  // Fetch user data from the database
  const fetchUserData = async (supabaseClient: SupabaseClient, userId: string): Promise<User | null> => {
    try {
      console.log('Fetching user data for ID:', userId);
      
      // Fetch user data from the users table
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }
      
      if (!userData) {
        console.log('No user data found for ID:', userId);
        return null;
      }
      
      console.log('User data fetched:', userData);
      
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      let roles: string[] = [];
      if (!rolesError && rolesData) {
        roles = rolesData.map(r => r.role);
        console.log('User roles fetched:', roles);
      } else if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }
      
      // Return user data
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        roles: roles.length > 0 ? roles : [userData.role]
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
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
        
        console.log('🔄 Setting initial user state at:', new Date().toISOString());
        setUser(initialUser);
        
        // Force navigation after setting user state
        console.log('🧭 Forcing navigation to dashboard at:', new Date().toISOString());
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      console.error('Error in login function:', error);
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
        console.error('Logout error:', error);
        throw error;
      }
      
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error in logout function:', error);
      throw error;
    }
  };
  
  // Register function
  const register = async (name: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'artist' // Default role
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      if (data.user) {
        // Create user record in the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: 'artist' // Default role
            }
          ]);
        
        if (insertError) {
          console.error('Error creating user record:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error in register function:', error);
      throw error;
    }
  };
  
  // Update user function
  const updateAuthUser = async (updates: Partial<User>) => {
    if (!supabase || !user) {
      throw new Error('Supabase client not initialized or user not logged in');
    }
    
    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          avatar: updates.avatar
        }
      });
      
      if (authError) {
        console.error('Error updating auth user:', authError);
        throw authError;
      }
      
      // Update user record in the users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (dbError) {
        console.error('Error updating user record:', dbError);
        throw dbError;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error in updateAuthUser function:', error);
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
        console.error('Error updating user role:', userError);
        throw userError;
      }
      
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('Error deleting user roles:', deleteError);
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
        console.error('Error inserting user roles:', insertError);
        throw insertError;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, role: primaryRole, roles } : null);
    } catch (error) {
      console.error('Error in updateUserRoles function:', error);
      throw error;
    }
  };
  
  // Update user password function
  const updateUserPassword = async (userId: string, newPassword: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    try {
      // Update user password in Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );
      
      if (error) {
        console.error('Error updating user password:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateUserPassword function:', error);
      throw error;
    }
  };
  
  // Provide the auth context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    supabase,
    login,
    logout,
    register,
    updateAuthUser,
    updateUserRoles,
    updateUserPassword
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);