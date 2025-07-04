const { createClient } = require("@supabase/supabase-js");

// Supabase client for all operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseServiceKey !== 'your_supabase_service_role_key' &&
    supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("✅ Supabase client initialized successfully");
    
    // Test the connection
    supabase.from("users").select("count").limit(1).then(result => {
      if (result.error) {
        console.log("⚠️  Database tables may not be set up yet");
      } else {
        console.log("✅ Database connection verified");
      }
    });
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error.message);
  }
} else {
  console.error("❌ Missing or invalid Supabase credentials! Please check your environment variables.");
  console.error("Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  console.error("Current SUPABASE_URL:", supabaseUrl);
  console.error("Service role key present:", !!supabaseServiceKey);
}

// For backward compatibility with pg queries
const pool = { connect: () => { throw new Error("Use Supabase client instead of direct pg connection"); } };
const query = () => { throw new Error("Use Supabase client instead of direct pg connection"); };

module.exports = { pool, query, supabase };
