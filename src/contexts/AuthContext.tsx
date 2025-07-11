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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to fetch user data from the 'users' table
  const fetchUserData = async (supabaseClient: SupabaseClient, userId: string): Promise<AppUser | null> => {
    try {
      // Fetch user data using the RPC function which should return user details including roles
      const { data: userData, error: userError } = await supabaseClient.rpc('get_user_with_roles', { user_id: userId });

      if (userError) {
        console.warn('Error fetching user data from DB, using fallback:', userError);
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
        // Assuming the 'get_user_with_roles' RPC returns an object with 'roles' as an array
        const roles = userData.roles || [userData.role]; // Fallback to primary role if 'roles' array is not present

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
      console.warn('Error in fetchUserData, using fallback:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    
    // Set a timeout to prevent infinite loading
    setTimeout(() => {
      setIsLoading(false);
      setAuthInitialized(true);
    }, 5000); // 5 seconds timeout as a fallback

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setAuthInitialized(true);
        setIsLoading(false);
        return;
      }
      
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !currentSession) {
        console.warn('Token refresh failed, signing out user');
        setSession(null);
        setAuthInitialized(true);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (currentSession) {
        setSession(currentSession);
        
        // Set user immediately with basic info from auth
        const authUser = currentSession.user;
        const userMetadata = authUser.user_metadata || {};
        const initialUser: AppUser = {
          id: authUser.id,
          name: userMetadata.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: userMetadata.role || 'artist',
          roles: userMetadata.roles || [userMetadata.role || 'artist'],
          avatar: userMetadata.avatar_url
        };
        setUser(initialUser);
        
        // Then fetch complete user data
        const appUser = await fetchUserData(supabase, currentSession.user.id)
          .catch(error => {
            console.warn('Error fetching user data on auth change:', error);
            return null;
          });
          
        if (appUser) {
          setUser(appUser);
        } else {
          console.warn('Failed to fetch complete user data on auth change, keeping auth data');
          // Keep the initial user data from auth
          setAuthInitialized(true);
        }
      } else {
        setSession(null);
        setUser(null);
        setAuthInitialized(true);
      }
      setIsLoading(false);
    });

    // Check for existing session on mount
    supabase.auth.getSession()
      .then(async ({ data: { session: currentSession } }) => {
        if (currentSession) {
          setSession(currentSession);
          
          // Set user immediately with basic info from auth
          const authUser = currentSession.user;
          const userMetadata = authUser.user_metadata || {};
          const initialUser: AppUser = {
            id: authUser.id,
            name: userMetadata.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: userMetadata.role || 'artist',
            roles: userMetadata.roles || [userMetadata.role || 'artist'],
            avatar: userMetadata.avatar_url
          };
          setUser(initialUser);
          
          // Then fetch complete user data
          try {
            const appUser = await fetchUserData(supabase, currentSession.user.id);
            if (appUser) {
              setUser(appUser);
            } else {
              // Keep the initial user if DB fetch fails
              console.warn('Failed to fetch complete user data on init, keeping auth data');
            }
          } catch (error) {
            console.warn('Error fetching user data on init:', error);
          }
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error getting session:', error);
        setAuthInitialized(true);
        setIsLoading(false);
      });

    return () => {
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
    isLoading: isLoading && !authInitialized,
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
    console.error('useAuth must be used within an AuthProvider');
    return {
      supabase: null,
      user: null,
      session: null,
      isLoading: false,
      login: async () => { throw new Error('Auth context not available'); },
      register: async () => { throw new Error('Auth context not available'); },
      logout: async () => { throw new Error('Auth context not available'); },
      updateAuthUser: async () => { throw new Error('Auth context not available'); },
      updateUserPassword: async () => { throw new Error('Auth context not available'); },
      updateUserRoles: async () => { throw new Error('Auth context not available'); },
    };
  }
  return context;
}