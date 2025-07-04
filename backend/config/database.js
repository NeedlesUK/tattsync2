const { createClient } = require("@supabase/supabase-js");

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

// Initialize public Supabase client (for user authentication)
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    supabaseUrl.startsWith('https://')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    console.log("✅ Supabase public client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Supabase public client:", error.message);
  }
} else {
  console.error("❌ Missing or invalid Supabase public credentials!");
  console.error("Required: SUPABASE_URL and SUPABASE_ANON_KEY");
  console.error("Current SUPABASE_URL:", supabaseUrl || "Not set");
  console.error("Anon key present:", !!supabaseAnonKey);
  console.error("Please update your backend/.env file with actual Supabase credentials from your Supabase project dashboard");
}

// Initialize admin Supabase client (for admin operations)
if (supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseServiceKey !== 'your_supabase_service_role_key' &&
    supabaseUrl.startsWith('https://')) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("✅ Supabase admin client initialized successfully");
    
    // Test the connection with better error handling
    supabaseAdmin.from("users").select("count").limit(1).then(result => {
      if (result.error) {
        if (result.error.code === '42P01') {
          console.log("⚠️  Database tables may not be set up yet");
        } else if (result.error.message.includes('JWT') || result.error.message.includes('permission')) {
          console.error("❌ Service Role Key authentication failed!");
          console.error("Please verify your SUPABASE_SERVICE_ROLE_KEY is correct and has proper permissions");
          console.error("Error:", result.error.message);
        } else {
          console.error("❌ Database connection test failed:", result.error.message);
        }
      } else {
        console.log("✅ Database connection verified");
      }
    }).catch(error => {
      console.error("❌ Failed to test database connection:", error.message);
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.error("This suggests your SUPABASE_SERVICE_ROLE_KEY may be incorrect or lacks permissions");
      }
    });
  } catch (error) {
    console.error("❌ Failed to initialize Supabase admin client:", error.message);
  }
} else {
  console.error("❌ Missing or invalid Supabase admin credentials!");
  console.error("Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  console.error("Current SUPABASE_URL:", supabaseUrl || "Not set");
  console.error("Service role key present:", !!supabaseServiceKey);
  console.error("Please update your backend/.env file with actual Supabase credentials");
}

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(supabase && supabaseAdmin);
};

// Helper function to handle Supabase errors gracefully
const handleSupabaseError = (error, operation = 'database operation') => {
  console.error(`❌ Supabase error during ${operation}:`, error);
  
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return {
      error: 'Database authentication failed. Please check your Supabase service role key configuration.',
      code: 'SUPABASE_AUTH_ERROR',
      statusCode: 500
    };
  }
  
  if (error.message.includes('JWT') || error.message.includes('permission')) {
    return {
      error: 'Database permission denied. Please verify your Supabase credentials.',
      code: 'SUPABASE_PERMISSION_ERROR', 
      statusCode: 500
    };
  }
  
  return {
    error: 'Database operation failed. Please try again later.',
    code: 'SUPABASE_ERROR',
    statusCode: 500
  };
};

// For backward compatibility with pg queries
const pool = { connect: () => { throw new Error("Use Supabase client instead of direct pg connection"); } };
const query = () => { throw new Error("Use Supabase client instead of direct pg connection"); };

module.exports = { 
  pool, 
  query, 
  supabase, 
  supabaseAdmin, 
  isSupabaseConfigured, 
  handleSupabaseError 
};