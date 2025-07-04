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
  console.warn("⚠️ Supabase credentials not found.");
}

// PostgreSQL connection using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Database connected successfully");
    const result = await client.query("SELECT NOW()");
    console.log("📅 Database time:", result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

testConnection();

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, supabase };
