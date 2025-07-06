import { createClient } from '@supabase/supabase-js';
import { getDbClient } from './tempDb';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize a basic client that will be replaced by the real one or temp DB
let supabase = createClient(supabaseUrl || 'https://example.com', supabaseAnonKey || 'dummy-key');
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
} else if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-supabase-anon-key') {
  console.error('Default placeholder Supabase credentials detected');
  console.error('Please update your .env file with actual Supabase credentials from your project dashboard');
} else {
  console.log('Supabase credentials found in environment variables');
// Initialize a basic client
let supabase = null; 

try {
  if (supabaseUrl && 
      supabaseAnonKey && 
      supabaseUrl !== 'your_supabase_project_url' && 
      supabaseAnonKey !== 'your_supabase_anon_key' && 
      supabaseUrl.startsWith('https://')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    console.log('✅ Supabase client created successfully');
  } else {
    console.warn('⚠️ Invalid Supabase credentials, falling back to temporary database');
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
}

// Get the appropriate client (real or temp)
supabase = getDbClient(supabase);

// Log available accounts
console.log('Available accounts:');
console.log('- gary@tattscore.com / password123');
console.log('- gary@gwts.co.uk / password123');

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