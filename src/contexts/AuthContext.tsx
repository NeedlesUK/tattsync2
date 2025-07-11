import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  supabase: SupabaseClient | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAuthUser: (updates: Partial<User>) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase credentials not found. Some features may not work.');
  console.log('Missing:', {
    url: !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    key: !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null
  });
}

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error checking session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found, fetching user data');
          await fetchUserData(session.user.id);
        } else {
          console.log('❌ No session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in checkSession:', error);
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in, fetching user data');
            await fetchUserData(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            console.log('❌ User signed out');
            setUser(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [navigate]);

  // Fetch user data from Supabase
  const fetchUserData = async (userId: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('🔍 Fetching user data for ID:', userId);
      
      // First, try to get the user from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError) {
        console.error('❌ Error fetching user data from Supabase:', userError);
      }
      
      if (userData) {
        console.log('✅ User data found in database:', userData);
        
        // Get user roles if available
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
          
        if (rolesError) {
          console.error('❌ Error fetching user roles:', rolesError);
        }
        
        const roles = rolesData ? rolesData.map(r => r.role) : [userData.role];
        
        // Get user profile if available
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('profile_picture')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
        }
        
        setUser({
          ...userData,
          roles,
          avatar: profileData?.profile_picture
        });
      } else {
        // User not found in database, try to create a new record
        console.log('⚠️ User not found in database, creating new record');
        
        // Get user data from auth
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Error getting auth user:', authError);
          throw authError;
        }
        
        if (!authUser.user) {
          console.error('❌ No auth user found');
          throw new Error('No auth user found');
        }
        
        // Create user record
        const newUser = {
          id: authUser.user.id,
          name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
          email: authUser.user.email || '',
          role: authUser.user.user_metadata?.role || 'artist'
        };
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser]);
          
        if (insertError) {
          console.error('❌ Error creating user record:', insertError);
          throw insertError;
        }
        
        console.log('✅ Created new user record');
        setUser({
          ...newUser,
          roles: [newUser.role]
        });
      }
    } catch (error) {
      console.error('❌ Error in fetchUserData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('🔑 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      console.log('✅ Login successful');
      
      // Set user immediately for better UX
      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const initialUser = {
          id: data.user.id,
          name: userMetadata.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: userMetadata.role || 'artist', 
          roles: userMetadata.roles || [userMetadata.role || 'artist']
        };
        
        setUser(initialUser);
        
        // Force navigation after setting user state
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error in login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }

      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('❌ Error in logout:', error);
    }
  };

  // Update user function
  const updateAuthUser = async (updates: Partial<User>) => {
    try {
      if (!supabase || !user) {
        throw new Error('Supabase client not initialized or user not logged in');
      }

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          role: updates.role
        }
      });

      if (authError) {
        console.error('❌ Error updating auth user:', authError);
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
        console.error('❌ Error updating user in database:', dbError);
        throw dbError;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('❌ Error in updateAuthUser:', error);
      throw error;
    }
  };

  // Update user roles
  const updateUserRoles = async (roles: string[], primaryRole: string) => {
    try {
      if (!supabase || !user) {
        throw new Error('Supabase client not initialized or user not logged in');
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
        console.error('❌ Error updating user role:', userError);
        throw userError;
      }

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Error deleting user roles:', deleteError);
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
        console.error('❌ Error inserting user roles:', insertError);
        throw insertError;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, role: primaryRole, roles } : null);
    } catch (error) {
      console.error('❌ Error in updateUserRoles:', error);
      throw error;
    }
  };

  // Update user password (admin function)
  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Only admins can update other users' passwords
      if (user?.role !== 'admin' && user?.id !== userId) {
        throw new Error('Unauthorized');
      }

      // Update user password
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) {
        console.error('❌ Error updating user password:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Error in updateUserPassword:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        supabase,
        login,
        logout,
        updateAuthUser,
        updateUserRoles,
        updateUserPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};