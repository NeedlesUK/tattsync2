const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

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
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not found. Some features may not work.');
  console.log('Missing:', {
    url: !supabaseUrl ? 'SUPABASE_URL' : null,
    key: !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null
  });
  console.log('💡 Please check your backend/.env file and ensure all Supabase credentials are set correctly.');
  console.log('💡 You can find these values in your Supabase project dashboard under Settings > API');
}

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure to:');
    console.log('   1. Set up your Supabase project');
    console.log('   2. Update your backend/.env file with Supabase credentials');
    console.log('   3. Run the database migration in Supabase SQL Editor');
    return false;
  }
}

// Initialize database connection
testConnection();

// Helper function to execute queries with better error handling
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { 
  pool, 
  query,
  supabase
};