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

// Test database connection
async function testConnection() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('❌ Database connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

// Initialize database connection
testConnection();

module.exports = { 
  supabase
};