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

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "postgres",
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // ALWAYS use SSL for Supabase
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Create connection pool
const pool = new Pool(dbConfig);

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

// Initialize database connection
testConnection();

// Helper function to execute queries
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