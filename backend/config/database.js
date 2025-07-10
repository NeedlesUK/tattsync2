const { createClient } = require('@supabase/supabase-js');

// Supabase client for admin operations
// Ensure we trim any whitespace from environment variables
const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 15) + '...');
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
    key: !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    url_value: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'undefined',
    key_value: supabaseServiceKey ? 'Key exists but is hidden for security' : 'undefined'
  });
  console.log('💡 Please check your backend/.env file and ensure all Supabase credentials are set correctly.');
  console.log('💡 You can find these values in your Supabase project dashboard under Settings > API');
}

// Test database connection
async function testConnection() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized - cannot test connection');
    return false;
  }
  
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('❌ Database connection test failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Database connection test successful!');
    console.log('Database response:', data);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

// Initialize database connection
testConnection();

module.exports = { 
  supabase
};