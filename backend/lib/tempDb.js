/**
 * Temporary Database Connection Module for Backend
 * 
 * This module provides a simple in-memory database for testing and development
 * when the actual Supabase connection is not available or experiencing issues.
 */

// Simple in-memory storage
const storage = {
  users: [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'artist',
      roles: ['artist'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Event Manager',
      email: 'manager@example.com',
      role: 'event_manager',
      roles: ['event_manager'],
      created_at: new Date().toISOString()
    },
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
const authStorage = {
  sessions: {},
  users: {
    'test@example.com': {
      password: 'password123',
      user: storage.users[0]
    },
    'manager@example.com': {
      password: 'password123',
      user: storage.users[1]
    },
    'gary@tattscore.com': {
      password: 'password123',
      user: storage.users[2]
    }
  }
};

// Mock Supabase client
const tempDb = {
  // Auth methods
  auth: {
    admin: {
      createUser: async ({ email, password, user_metadata, email_confirm }) => {
        // Check if user already exists
        if (authStorage.users[email.toLowerCase()]) {
          return {
            data: { user: null },
            error: { message: 'User already registered' }
          };
        }
        
        const newUser = {
          id: `user_${Date.now()}`,
          email,
          user_metadata,
          created_at: new Date().toISOString()
        };
        
        authStorage.users[email.toLowerCase()] = {
          password,
          user: newUser
        };
        
        return {
          data: { user: newUser },
          error: null
        };
      },
      deleteUser: async (userId) => {
        // Find user by ID and remove
        const userEmail = Object.keys(authStorage.users).find(
          email => authStorage.users[email].user.id === userId
        );
        
        if (userEmail) {
          delete authStorage.users[userEmail];
          return { error: null };
        }
        
        return { error: { message: 'User not found' } };
      }
    },
    signInWithPassword: async ({ email, password }) => {
      console.log('TempDB: Attempting login with', email);
      const user = authStorage.users[email.toLowerCase()];
      
      if (!user || user.password !== password) {
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
    setSession: async ({ access_token }) => {
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
    }
  },
  
  // Database methods
  from: (table) => {
    return {
      select: (columns = '*') => {
        return {
          eq: (column, value) => {
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
              limit: (limit) => {
                const items = (storage[table] || [])
                  .filter(item => item[column] === value)
                  .slice(0, limit);
                return {
                  data: items,
                  error: null
                };
              }
            };
          },
          order: (orderColumn, { ascending = true } = {}) => {
            const items = [...(storage[table] || [])].sort((a, b) => {
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
      insert: (data) => {
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
          select: (columns = '*') => {
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
      update: (data) => {
        return {
          eq: (column, value) => {
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
              error: null
            };
          }
        };
      },
      upsert: (data) => {
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
  rpc: (functionName, params) => {
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
    
    return { data: null, error: { message: 'Function not implemented' } };
  }
};

// Helper function to check if temp DB should be used
const shouldUseTempDb = () => {
  // Check if Supabase URL is missing or invalid
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return !supabaseUrl || 
         !supabaseServiceKey || 
         supabaseUrl === 'your_supabase_project_url' || 
         supabaseServiceKey === 'your_supabase_service_role_key' ||
         !supabaseUrl.startsWith('https://');
};

// Export a function to get either the real Supabase client or the temp DB
const getDbClient = (realSupabase, realSupabaseAdmin) => {
  if (shouldUseTempDb() || !realSupabase) {
    console.log('⚠️ Using temporary in-memory database for development');
    return { supabase: tempDb, supabaseAdmin: tempDb };
  }
  
  return { supabase: realSupabase, supabaseAdmin: realSupabaseAdmin };
};

module.exports = {
  tempDb,
  shouldUseTempDb,
  getDbClient
};