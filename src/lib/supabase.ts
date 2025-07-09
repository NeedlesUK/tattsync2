import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Function to validate Supabase credentials
function validateCredentials() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
    console.error('💡 To fix this:');
    console.error('   1. Create a .env file in your project root');
    console.error('   2. Copy values from .env.example');
    console.error('   3. Replace with your actual Supabase project credentials');
    console.error('   4. Restart your development server');
    return false;
  }
  
  if (supabaseUrl === 'https://your-project-id.supabase.co' || 
      supabaseUrl === 'your_supabase_project_url' || 
      supabaseAnonKey === 'your-supabase-anon-key' || 
      supabaseAnonKey === 'your_supabase_anon_key') {
    console.error('❌ Default placeholder Supabase credentials detected');
    console.error('Please update your .env file with actual Supabase credentials from your project dashboard');
    console.error('💡 Get your credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
    return false;
  }
  
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. URL must start with https://');
    console.error('💡 Expected format: https://your-project-id.supabase.co');
    return false;
  }
  
  console.log('✅ Supabase credentials found in environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl.substring(0, 15) + '...');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 5) + '...');
  return true;
}

// Create client only if we have valid credentials
let supabase = null;

try {
  if (validateCredentials()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true, 
        detectSessionInUrl: false
      }
    });
    console.log('✅ Supabase client created successfully');
    
    // Test the connection
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error testing Supabase connection:', error.message);
          if (error.message?.includes('Failed to fetch')) {
            console.error('🌐 Network connectivity issue detected');
            console.error('💡 Please check:');
            console.error('   1. Internet connection');
            console.error('   2. Supabase service status at status.supabase.com');
            console.error('   3. Firewall/VPN settings blocking Supabase');
            console.error('   4. Your Supabase project URL is correct');
          }
        } else {
          console.log('✅ Supabase connection test successful');
        }
      })
      .catch((error) => {
        console.error('❌ Failed to test Supabase connection:', error.message);
        console.error('🌐 This may indicate a network connectivity issue');
      });
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
  supabase = null;
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