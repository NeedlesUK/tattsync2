/**
 * Temporary Database Connection Module for Frontend
 * 
 * This module provides a simple in-memory database for testing and development
 * when the actual Supabase connection is not available or experiencing issues.
 */

// Simple in-memory storage
const storage: Record<string, any[]> = {
  users: [
    {
      id: '3',
      name: 'Gary Watts',
      email: 'gary@tattscore.com',
      role: 'admin',
      roles: ['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge'],
      created_at: new Date().toISOString()
    }
  ],
  events: [
    {
      id: 1,
      name: 'Ink Fest 2024',
      description: 'The premier tattoo convention on the West Coast',
      event_slug: 'ink-fest-2024',
      start_date: '2024-03-15',
      end_date: '2024-03-17',
      location: 'Los Angeles, CA',
      venue: 'LA Convention Center',
      max_attendees: 500,
      status: 'published',
      created_at: new Date().toISOString(),
      event_manager_id: '2'
    }
  ],
  applications: [],
  user_profiles: []
};

// Simple authentication storage
const authStorage: Record<string, any> = {
  sessions: {},
  users: {    
    'gary@tattscore.com': {
      password: 'password123',
      user: storage.users[0]
    }
  }
};

// Mock Supabase client
export const tempDb = {
  // Auth methods
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('TempDB: Attempting login with', email);
      const user = authStorage.users[email.toLowerCase()];
      
      if (!user) {
        console.log('TempDB: User not found:', email);
        return {
          data: { session: null, user: null },
          error: { message: 'User not found' }
        };
      }
      
      if (user.password !== password) {
        console.log('TempDB: Invalid credentials for', email);
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid login credentials' }
        };
      }
      
      console.log('TempDB: Login successful for', email);
      const session = {
        access_token: `mock_token_${Date.now()}`,
        user: user.user
      };
      
      authStorage.sessions[session.access_token] = {
        user: user.user,
        created_at: new Date().toISOString()
      };
      
      return {
        data: { session, user: user.user },
        error: null
      };
    },
    signOut: async () => {
      console.log('TempDB: Signing out');
      return { error: null };
    },
    getSession: async () => {
      // Return a mock session for testing
      const mockSession = {
        access_token: 'mock_token',
        user: storage.users[0]
      };
      
      return {
        data: { session: mockSession },
        error: null
      };
    },
    onAuthStateChange: (callback: any) => {
      // Immediately invoke callback with mock session
      callback('SIGNED_IN', { session: { user: storage.users[0] } });
      
      // Return mock unsubscribe function
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    setSession: async ({ access_token }: { access_token: string }) => {
      const session = authStorage.sessions[access_token];
      
      if (!session) {
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid or expired token' }
        };
      }
      
      return {
        data: { session: { access_token, user: session.user }, user: session.user },
        error: null
      };
    },
    updateUser: async (updates: any) => {
      // Mock updating user
      console.log('TempDB: Updating user with', updates);
      return { error: null };
    }
  },
  
  // Database methods
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: () => {
                const item = (storage[table] || []).find(item => item[column] === value);
                return {
                  data: item || null,
                  error: item ? null : { message: 'No item found' }
                };
              },
              maybeSingle: () => {
                const item = (storage[table] || []).find(item => item[column] === value);
                return {
                  data: item || null,
                  error: null
                };
              },
              limit: (limit: number) => {
                const items = (storage[table] || [])
                  .filter(item => item[column] === value)
                  .slice(0, limit);
                return {
                  data: items,
                  error: null
                };
              },
              order: (orderColumn: string, { ascending = true } = {}) => {
                const items = (storage[table] || [])
                  .filter(item => item[column] === value)
                  .sort((a, b) => {
                    if (ascending) {
                      return a[orderColumn] > b[orderColumn] ? 1 : -1;
                    } else {
                      return a[orderColumn] < b[orderColumn] ? 1 : -1;
                    }
                  });
                return {
                  data: items,
                  error: null
                };
              }
            };
          },
          order: (column: string, { ascending = true } = {}) => {
            const items = [...(storage[table] || [])].sort((a, b) => {
              if (ascending) {
                return a[column] > b[column] ? 1 : -1;
              } else {
                return a[column] < b[column] ? 1 : -1;
              }
            });
            return {
              data: items,
              error: null
            };
          }
        };
      },
      insert: (data: any) => {
        const newItem = {
          id: typeof data.id !== 'undefined' ? data.id : Date.now().toString(),
          ...data
        };
        
        if (!storage[table]) {
          storage[table] = [];
        }
        
        storage[table].push(newItem);
        
        return {
          data: newItem,
          error: null,
          select: (columns: string = '*') => {
            return {
              single: () => {
                return {
                  data: newItem,
                  error: null
                };
              }
            };
          }
        };
      },
      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            if (!storage[table]) {
              return { data: null, error: { message: 'Table not found' } };
            }
            
            const index = storage[table].findIndex(item => item[column] === value);
            
            if (index === -1) {
              return { data: null, error: { message: 'Item not found' } };
            }
            
            storage[table][index] = {
              ...storage[table][index],
              ...data
            };
            
            return {
              data: storage[table][index],
              error: null,
              select: (columns: string = '*') => {
                return {
                  single: () => {
                    return {
                      data: storage[table][index],
                      error: null
                    };
                  }
                };
              }
            };
          }
        };
      },
      upsert: (data: any) => {
        if (!storage[table]) {
          storage[table] = [];
        }
        
        const idField = 'id';
        const index = storage[table].findIndex(item => item[idField] === data[idField]);
        
        if (index === -1) {
          // Insert
          const newItem = {
            id: typeof data.id !== 'undefined' ? data.id : Date.now().toString(),
            ...data
          };
          storage[table].push(newItem);
          return { data: newItem, error: null };
        } else {
          // Update
          storage[table][index] = {
            ...storage[table][index],
            ...data
          };
          return { data: storage[table][index], error: null };
        }
      }
    };
  },
  
  // RPC methods
  rpc: (functionName: string, params: any) => {
    // Handle specific RPC functions
    if (functionName === 'set_primary_role') {
      const { user_uuid, primary_role } = params;
      
      // Find user in users table
      const userIndex = storage.users.findIndex(user => user.id === user_uuid);
      
      if (userIndex !== -1) {
        // Update user's primary role
        storage.users[userIndex].role = primary_role;
        
        // Ensure role exists in user_roles
        if (!storage.user_roles) {
          storage.user_roles = [];
        }
        
        // Find or create role entry
        const roleIndex = storage.user_roles.findIndex(
          role => role.user_id === user_uuid && role.role === primary_role
        );
        
        if (roleIndex === -1) {
          // Add role if it doesn't exist
          storage.user_roles.push({
            id: Date.now(),
            user_id: user_uuid,
            role: primary_role,
            is_primary: true,
            created_at: new Date().toISOString()
          });
        } else {
          // Set as primary
          storage.user_roles[roleIndex].is_primary = true;
        }
        
        // Set other roles as non-primary
        storage.user_roles.forEach((role, idx) => {
          if (role.user_id === user_uuid && role.role !== primary_role) {
            storage.user_roles[idx].is_primary = false;
          }
        });
        
        return { data: true, error: null };
      }
      
      return { data: false, error: { message: 'User not found' } };
    }
    
    if (functionName === 'add_user_role') {
      const { user_uuid, new_role } = params;
      
      if (!storage.user_roles) {
        storage.user_roles = [];
      }
      
      // Check if role already exists
      const exists = storage.user_roles.some(
        role => role.user_id === user_uuid && role.role === new_role
      );
      
      if (!exists) {
        storage.user_roles.push({
          id: Date.now(),
          user_id: user_uuid,
          role: new_role,
          is_primary: false,
          created_at: new Date().toISOString()
        });
      }
      
      return { data: true, error: null };
    }
    
    if (functionName === 'remove_user_role') {
      const { user_uuid, role_to_remove } = params;
      
      if (!storage.user_roles) {
        return { data: false, error: { message: 'No roles found' } };
      }
      
      // Check if this is the primary role
      const isPrimary = storage.user_roles.some(
        role => role.user_id === user_uuid && role.role === role_to_remove && role.is_primary
      );
      
      if (isPrimary) {
        return { data: false, error: { message: 'Cannot remove primary role' } };
      }
      
      // Count user's roles
      const userRoles = storage.user_roles.filter(role => role.user_id === user_uuid);
      
      if (userRoles.length <= 1) {
        return { data: false, error: { message: 'Cannot remove the only role' } };
      }
      
      // Remove the role
      storage.user_roles = storage.user_roles.filter(
        role => !(role.user_id === user_uuid && role.role === role_to_remove)
      );
      
      return { data: true, error: null };
    }
    
    return { data: null, error: { message: 'Function not implemented' } };
  }
};

// Helper function to check if temp DB should be used
export const shouldUseTempDb = () => {
  // Check if Supabase URL is missing or invalid
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  return !supabaseUrl || 
         !supabaseAnonKey || 
         supabaseUrl === 'your_supabase_project_url' || 
         supabaseAnonKey === 'your_supabase_anon_key' ||
         !supabaseUrl.startsWith('https://');
};

// Export a function to get either the real Supabase client or the temp DB
export const getDbClient = (realSupabase: any) => {
  if (shouldUseTempDb() || !realSupabase) {
    console.log('⚠️ Using temporary in-memory database for development or testing');
    console.log('Available test accounts:');
    console.log('- gary@tattscore.com / password123 (Admin)');
    console.log('- test@example.com / password123 (Artist)');
    console.log('- manager@example.com / password123 (Event Manager)');
    return tempDb;
  }
  
  return realSupabase;
};