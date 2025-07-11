import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Define the user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  avatar?: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  supabase: SupabaseClient | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAuthUser: (userData: Partial<User>) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase credentials not found. Some features may not work.');
  console.log('Missing:', {
    url: !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    key: !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null
  });
}

// Create the auth provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Set up a safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Safety timeout reached - forcing loading state to false');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        console.log('Checking for existing session...');
        
        if (!supabase) {
          console.warn('No Supabase client available');
          setIsLoading(false);
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          console.log('Session found, fetching user data');
          const userId = session.user.id;
          
          // Fetch user data from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            setIsLoading(false);
            return;
          }
          
          if (userData) {
            console.log('User data fetched successfully');
            
            // Fetch user roles
            const { data: rolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId);
              
            const roles = rolesError ? [] : rolesData?.map(r => r.role) || [];
            
            setUser({
              id: userId,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              roles: roles.length > 0 ? roles : [userData.role]
            });
          } else {
            // User not found in database, create a new user record
            const userMetadata = session.user.user_metadata || {};
            const email = session.user.email || '';
            const name = userMetadata.name || email.split('@')[0] || 'User';
            
            const newUser = {
              id: userId,
              name,
              email,
              role: 'artist', // Default role
            };
            
            const { error: insertError } = await supabase
              .from('users')
              .insert([newUser]);
              
            if (insertError) {
              console.error('Error creating user record:', insertError);
            } else {
              console.log('Created new user record');
              setUser(newUser);
            }
          }
        } else {
          console.log('No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session) {
            // User signed in, fetch their data
            const userId = session.user.id;
            
            // Fetch user data from the database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (userError) {
              console.error('Error fetching user data:', userError);
              return;
            }
            
            if (userData) {
              // Fetch user roles
              const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId);
                
              const roles = rolesError ? [] : rolesData?.map(r => r.role) || [];
              
              setUser({
                id: userId,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                roles: roles.length > 0 ? roles : [userData.role]
              });
              
              // Navigate to dashboard
              navigate('/dashboard');
            }
          } else if (event === 'SIGNED_OUT') {
            // User signed out
            setUser(null);
            navigate('/');
          }
        }
      );
      
      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [navigate]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful, session:', data.session ? 'exists' : 'null');
      
      if (data.session) {
        // Set user immediately after login success
        const userMetadata = data.session.user.user_metadata || {};
        const initialUser = {
          id: data.session.user.id,
          name: userMetadata.name || data.session.user.email?.split('@')[0] || 'User',
          email: data.session.user.email || '',
          role: userMetadata.role || 'artist', 
          roles: userMetadata.roles || [userMetadata.role || 'artist']
        };
        
        setUser(initialUser);
        
        // Force navigation after setting user state
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in login function:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error in logout function:', error);
      throw error;
    }
  };

  // Update user function
  const updateAuthUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!supabase || !user) {
        throw new Error('Supabase client or user not available');
      }
      
      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name || user.name,
          email: userData.email || user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Error in updateAuthUser function:', error);
      throw error;
    }
  };

  // Update user roles function
  const updateUserRoles = async (roles: string[], primaryRole: string): Promise<void> => {
    try {
      if (!supabase || !user) {
        throw new Error('Supabase client or user not available');
      }
      
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
      const roleRecords = roles.map(role => ({
        user_id: user.id,
        role,
        is_primary: role === primaryRole
      }));
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleRecords);
        
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

  // Update user password function (admin only)
  const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Check if current user is admin
      if (user?.role !== 'admin') {
        throw new Error('Only admins can update user passwords');
      }
      
      // Update user password
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

  // Create the context value
  const value: AuthContextType = {
    user,
    supabase,
    isLoading,
    login,
    logout,
    updateAuthUser,
    updateUserRoles,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};