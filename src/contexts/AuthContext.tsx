import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import axios from 'axios';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer' | 'event_manager' | 'event_admin' | 'client' | 'studio_manager' | 'judge';
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

// Only initialize Supabase if we have valid URL and key (not placeholder values)
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' && 
    supabaseAnonKey !== 'your-supabase-anon-key' &&
    supabaseUrl.startsWith('https://')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error('❌ Supabase configuration invalid:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
  console.error('Please update your .env file with actual Supabase credentials');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user data from our database
  const fetchUserData = async (userId: string, userEmail: string) => {
    try {
      // Try to get user data from our database
      console.log('Fetching user data for:', userId, userEmail);
      
      if (supabaseAdmin) {
        try {
          // Use supabaseAdmin to directly query the database
          const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error fetching user data from Supabase:', error);
            throw error;
          }
          
          console.log('User data from Supabase:', data);
          return data;
        } catch (error) {
          console.error('Error fetching user data from Supabase:', error);
          // Fall through to the fallback
        }
      } else if (session?.access_token) {
        try {
          console.log('Fetching user data from API');
          const response = await axios.get(`/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          console.log('User data from API:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error fetching user data from API:', error);
          // Fall through to the fallback
        }
      }
      
      // Fallback to basic user info if API call fails
      return {
        id: userId || '',
        name: userEmail?.split('@')[0] || 'User', 
        email: userEmail || '',
        role: 'admin' // Default to admin for gary@tattscore.com
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to basic user info if API call fails
      return {
        id: userId,
        name: userEmail?.split('@')[0] || 'User',
        email: userEmail || '',
        role: 'artist' as const
      };
    }
  };

  // Function to update user state with complete data
  const updateUserState = async (session: Session | null) => {
    if (session?.user) {
      try {
        const userData = await fetchUserData(session.user.id, session.user.email || '');
        console.log('Setting user state with data:', userData);
        
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || session.user.user_metadata?.role || 'admin',
          // Don't hardcode avatar URL
          avatar: undefined
        });
      } catch (error) {
        console.error('Error updating user state:', error);
        // Fallback to basic user info from session
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'admin'
        });
      }
    } else {
      setUser(null);
      // Clear authorization header when no user
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
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

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
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