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
    
    // Test the connection
    supabaseAdmin.from("users").select("count").limit(1).then(result => {
      if (result.error) {
        console.log("⚠️  Database tables may not be set up yet");
      } else {
        console.log("✅ Database connection verified");
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

// For backward compatibility with pg queries
const pool = { connect: () => { throw new Error("Use Supabase client instead of direct pg connection"); } };
const query = () => { throw new Error("Use Supabase client instead of direct pg connection"); };

module.exports = { pool, query, supabase, supabaseAdmin };