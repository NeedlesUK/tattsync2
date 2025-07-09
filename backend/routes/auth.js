const express = require('express');
const { supabase, supabaseAdmin } = require('../config/database');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Restrict admin role registration - only existing admins can create new admins
    if (role === 'admin') {
      return res.status(403).json({ 
        error: 'Direct registration as admin is not allowed. Admin accounts must be created by existing administrators.' 
      });
    }

    // Restrict event_manager role registration - only admins can assign this role
    if (role === 'event_manager') {
      return res.status(403).json({ 
        error: 'Event Manager accounts are created by administrators when assigning events.' 
      });
    }

    if (!supabase) {
      return res.status(500).json({ 
        error: 'Supabase not configured. Please check environment variables.' 
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
          console.log('✅ Successfully fetched user data from database:', userData.name);
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Insert user data into our custom users table using admin client
    if (data.user) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: data.user.id,
          name,
          email,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user data:', insertError);
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.user?.id,
        name,
        email,
        role
      },
      session: data.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
          name: userData?.name || 'Unknown User', // Prioritize database name
          email: data.user.email,
          role: userData?.role || 'artist' // Prioritize database role
        error: 'Supabase not configured. Please check environment variables.' 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user data from our custom table using admin client
    let userData = null;
    try {
      const { data: userResult, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!userError) {
        userData = userResult;
      }
    } catch (dbError) {
      console.error('Error fetching user data:', dbError);
    }

    res.json({
      message: 'Login successful',
      session: data.session,
      user: {
        id: data.user.id,
        name: userData?.name || data.user.user_metadata?.name,
        email: data.user.email,
        role: userData?.role || data.user.user_metadata?.role || 'artist'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;