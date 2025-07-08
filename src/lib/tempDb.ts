/**
 * Temporary Database Connection Module for Frontend
 * 
 * This module provides a simple in-memory database for testing and development
 * when the actual Supabase connection is not available or experiencing issues.
 */

// Helper function to check if temp DB should be used
export const shouldUseTempDb = () => {
  // Check if Supabase credentials are available and valid
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !supabaseUrl || 
         !supabaseAnonKey || 
         supabaseUrl === 'your_supabase_project_url' || 
         supabaseAnonKey === 'your_supabase_anon_key';
};

// Export a function to get either the real Supabase client or the temp DB
export const getDbClient = (realSupabase: any) => {
  if (shouldUseTempDb()) {
    console.log('⚠️ Using temporary database for development');
    
    // Create a mock Supabase client with basic functionality
    const mockSupabase = {
      auth: {
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          // For testing, accept any credentials with valid format
          if (!email || !password) {
            return { data: null, error: { message: 'Email and password are required' } };
          }
          
          // For testing purposes, accept admin@tattsync.com/password123
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
        signOut: async () => {
          return { error: null };
        },
        getSession: async () => {
          return { data: { session: null } };
        },
        onAuthStateChange: () => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      },
      from: (table: string) => {
        return {
          select: () => {
            return {
              eq: () => {
                return {
                  single: async () => {
                    if (table === 'users') {
                      return {
                        data: {
                          id: '00000000-0000-0000-0000-000000000000',
                          name: 'Admin User',
                          email: 'admin@tattsync.com',
                          role: 'admin'
                        },
                        error: null
                      };
                    }
                    return { data: null, error: null };
                  }
                };
              }
            };
          }
        };
      }
    };
    
    return { supabase: mockSupabase, supabaseAdmin: mockSupabase };
  }
  
  // Return the real Supabase clients
  return { supabase: realSupabase, supabaseAdmin: realSupabaseAdmin };
};