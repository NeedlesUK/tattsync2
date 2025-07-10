const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

console.log('Environment Variables Check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');

// Try to initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseServiceKey) {
  try {
    console.log('\nAttempting to initialize Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase client initialized successfully');
    
    // Test a simple query
    console.log('\nAttempting to query Supabase...');
    supabase
      .from('users')
      .select('count')
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Database query failed:', error.message);
          console.error('Error details:', error);
        } else {
          console.log('✅ Database query successful!');
          console.log('Data:', data);
        }
      });
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    console.error('Error details:', error);
  }
} else {
  console.error('❌ Cannot initialize Supabase client: missing credentials');
}