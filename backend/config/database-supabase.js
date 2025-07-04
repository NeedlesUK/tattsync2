const { createClient } = require("@supabase/supabase-js");

// Supabase client for all operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
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
  console.error("❌ Missing Supabase credentials!");
}

// For backward compatibility with pg queries
const pool = { connect: () => { throw new Error("Use Supabase client instead of direct pg connection"); } };
const query = () => { throw new Error("Use Supabase client instead of direct pg connection"); };

module.exports = { pool, query, supabase };
