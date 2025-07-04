import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase credentials and log detailed information
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing in your environment variables');
} else if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing in your environment variables');
} else if (supabaseUrl === 'https://your-project-id.supabase.co' || 
           supabaseAnonKey === 'your-supabase-anon-key') {
  console.error('Missing or invalid Supabase environment variables');
  console.error('Please update your .env file with actual Supabase credentials');
}

// Create client only if we have valid credentials
export const supabase = (supabaseUrl && 
                         supabaseAnonKey && 
                         supabaseUrl !== 'https://your-project-id.supabase.co' && 
                         supabaseAnonKey !== 'your-supabase-anon-key' && 
                         supabaseUrl.startsWith('https://')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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