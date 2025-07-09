require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool, supabase } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: supabase ? 'connected' : 'not connected'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the TattSync API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/events',
      '/api/applications'
    ]
  });
});

// User routes
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
    
    // Update user password
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Application routes
app.get('/api/applications', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});