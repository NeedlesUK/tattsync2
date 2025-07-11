import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Define the shape of the user object stored in context
interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  avatar?: string;
}

// Define the shape of the AuthContext
interface AuthContextType {
  supabase: SupabaseClient | null;
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAuthUser: (updates: { name?: string; email?: string; avatar?: string }) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  updateUserRoles: (roles: string[], primaryRole: string) => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully in AuthContext');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client in AuthContext:', error);
    supabase = null;
  }
} else {
  console.error('❌ Supabase URL or Anon Key is missing. Auth features will not work.');
}

// AuthProvider component
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user data from the 'users' table
  const fetchUserData = async (supabaseClient: SupabaseClient, userId: string): Promise<AppUser | null> => {
    try {
      // Fetch user data from the 'users' table
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('id, name, email, role, user_roles(role)') // Select user_roles to get all roles
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data from DB:', userError);
        // Fallback to auth.user data if DB fetch fails
        const { data } = await supabaseClient.auth.getSession();
        const authUser = data.session?.user;
        if (authUser) {
          return {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: authUser.user_metadata?.role || 'artist', // Default role
            roles: authUser.user_metadata?.roles || [authUser.user_metadata?.role || 'artist'],
            avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || undefined,
          };
        }
        return null;
      }

      if (userData) {
        // Handle case where user_roles might be null
        const userRoles = userData.user_roles || [];
        const roles = Array.isArray(userRoles) 
          ? userRoles.map((ur: { role: string }) => ur.role) 
          : [];
          
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role, // Primary role
          roles: roles.length > 0 ? roles : [userData.role], // All roles or fallback to primary role
          avatar: userData.avatar || undefined, // Assuming avatar might be in user_profiles or users table
        };
      }
      return null;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, setting isLoading to false');
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      if (currentSession) {
        setSession(currentSession);
        try {
          const appUser = await fetchUserData(supabase, currentSession.user.id);
          if (appUser) {
            setUser(appUser);
          }
        } catch (error) {
          console.error('Error fetching user data on auth change:', error);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
        try {
          const appUser = await fetchUserData(supabase, currentSession.user.id);
          if (appUser) {
            setUser(appUser);
          }
        } catch (error) {
          console.error('Error fetching user data on init:', error);
        }
      }
      setIsLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setIsLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          // Default role for new registrations, can be updated later
          role: 'artist', 
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Insert into public.users table
      const { error: dbError } = await supabase.from('users').insert({
        id: data.user.id,
        name: name,
        email: email,
        role: 'artist', // Default role
      });

      if (dbError) {
        console.error('Error inserting user into public.users:', dbError);
        // Handle this error, maybe delete the auth.user if public.users insertion fails
        throw new Error('Failed to create user profile. Please try again.');
      }
      
      // Insert into user_roles table
      const { error: rolesError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'artist',
        is_primary: true,
      });

      if (rolesError) {
        console.error('Error inserting user role:', rolesError);
        throw new Error('Failed to assign user role. Please try again.');
      }
    }
  };

  // Logout function
  const logout = async () => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
  };

  // Update user in auth.users and public.users
  const updateAuthUser = async (updates: { name?: string; email?: string; avatar?: string }) => {
    if (!supabase || !user) {
      throw new Error('Supabase client or user not available');
    }

    const { data, error: authError } = await supabase.auth.updateUser({
      email: updates.email,
      data: {
        name: updates.name,
        avatar_url: updates.avatar,
      },
    });

    if (authError) {
      throw authError;
    }

    if (data.user) {
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          // Assuming avatar is stored in user_profiles, not directly in users table
          // You would update user_profiles table here if needed
        })
        .eq('id', data.user.id);

      if (dbError) {
        console.error('Error updating user in public.users:', dbError);
        throw new Error('Failed to update user profile in database.');
      }

      // Refresh local user state
      const updatedUser = await fetchUserData(supabase, data.user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  // Update user password
  const updateUserPassword = async (userId: string, newPassword: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Supabase's updateUser function handles password changes directly
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  };

  // Update user roles
  const updateUserRoles = async (roles: string[], primaryRole: string) => {
    if (!supabase || !user) {
      throw new Error('Supabase client or user not available');
    }

    // Update primary role in public.users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ role: primaryRole })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating primary user role:', userUpdateError);
      throw new Error('Failed to update primary user role.');
    }

    // Delete existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting existing user roles:', deleteError);
      throw new Error('Failed to clear existing user roles.');
    }

    // Insert new roles
    const rolesToInsert = roles.map((role) => ({
      user_id: user.id,
      role: role,
      is_primary: role === primaryRole,
    }));

    const { error: insertError } = await supabase.from('user_roles').insert(rolesToInsert);

    if (insertError) {
      console.error('Error inserting new user roles:', insertError);
      throw new Error('Failed to assign new user roles.');
    }

    // Refresh local user state
    const updatedUser = await fetchUserData(supabase, user.id);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const contextValue: AuthContextType = {
    supabase,
    user,
    session,
    isLoading,
    login,
    register,
    logout,
    updateAuthUser,
    updateUserPassword,
    updateUserRoles,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}