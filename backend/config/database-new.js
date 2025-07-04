const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");

// Supabase client for admin operations
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
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error.message);
  }
} else {
  console.warn("⚠️ Supabase credentials not found. Some features may not work.");
}
