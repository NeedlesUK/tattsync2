import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Function to validate Supabase credentials
function validateCredentials() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
    return false;
  }
  
  if (supabaseUrl === 'https://your-project-id.supabase.co' || 
      supabaseUrl === 'your_supabase_project_url' || 
      supabaseAnonKey === 'your-supabase-anon-key' || 
      supabaseAnonKey === 'your_supabase_anon_key') {
    console.error('❌ Default placeholder Supabase credentials detected');
    console.error('Please update your .env file with actual Supabase credentials from your project dashboard');
    return false;
  }
  
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. URL must start with https://');
    return false;
  }
  
  console.log('✅ Supabase credentials found in environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl.substring(0, 15) + '...');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 5) + '...');
  return true;
}

// Create client only if we have valid credentials
let supabase = null;

// Add a timeout for Supabase operations
const SUPABASE_TIMEOUT = 10000; // 10 seconds

try {
  if (validateCredentials()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true, 
        storageKey: 'tattsync-auth',
        detectSessionInUrl: false
      }
    });
    console.log('✅ Supabase client created successfully');
    
    // Test the connection
    supabase.auth.getSession().then(({ data, error }) => {
      if (data && data.session) {
        console.log('✅ Supabase session found');
        
        // Log session expiry time
        const expiresAt = new Date(data.session.expires_at * 1000);
        const now = new Date();
        const minutesUntilExpiry = Math.round((expiresAt.getTime() - now.getTime()) / 60000);
        console.log(`Session expires in ${minutesUntilExpiry} minutes`);
        
      } else if (error) {
        console.warn('⚠️ Supabase session test returned an error:', error.message);
        console.log('This is normal if you are not logged in');
      } else {
        console.log('✅ Supabase connection test successful');
        if (data.session) {
          console.log('User is already logged in');
        } else {
          console.log('No active session found');
        }
      }
    });
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
  supabase = null;
  
  // Create a mock client for development
  console.warn('⚠️ Creating mock Supabase client for development');
  supabase = {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        console.log('Mock login with:', email);
        if (email === 'admin@tattsync.com' && password === 'password123') {
          return {
            data: {
              user: {
                id: '00000000-0000-0000-0000-000000000000',
                email: email,
                user_metadata: { name: 'Admin User', role: 'admin' }
              },
              session: {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600000
              }
            },
            error: null
          };
        }
        return { data: null, error: { message: 'Invalid login credentials' } };
      },
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    })
  };
}

export { supabase };

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer';
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer';
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: 'admin' | 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer';
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: number;
          name: string;
          description?: string;
          event_slug: string;
          start_date: string;
          end_date: string;
          location: string;
          venue?: string;
          max_attendees: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          name: string;
          description?: string;
          event_slug: string;
          start_date: string;
          end_date: string;
          location: string;
          venue?: string;
          max_attendees?: number;
          status?: 'draft' | 'published' | 'archived';
        };
        Update: {
          name?: string;
          description?: string;
          event_slug?: string;
          start_date?: string;
          end_date?: string;
          location?: string;
          venue?: string;
          max_attendees?: number;
          status?: 'draft' | 'published' | 'archived';
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: number;
          user_id: string;
          event_id: number;
          application_type: 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer';
          status: 'pending' | 'approved' | 'rejected';
          experience_years?: number;
          portfolio_url?: string;
          additional_info?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          event_id: number;
          application_type: 'artist' | 'piercer' | 'performer' | 'trader' | 'volunteer';
          status?: 'pending' | 'approved' | 'rejected';
          experience_years?: number;
          portfolio_url?: string;
          additional_info?: string;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          experience_years?: number;
          portfolio_url?: string;
          additional_info?: string;
          updated_at?: string;
        };
      };
    };
  };
}