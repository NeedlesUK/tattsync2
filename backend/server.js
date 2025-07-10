require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
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
    key: !supabaseKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabase ? 'connected' : 'not connected'
  });
});

// Admin routes
app.patch('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    
    // Call the admin_reset_password RPC function
    const { data, error } = await supabase.rpc('admin_reset_password', {
      user_id: userId,
      new_password: newPassword
    });
    
    if (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in password reset endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
});