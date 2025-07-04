const express = require('express');
const { supabase, supabaseAdmin } = require('../config/database');
const router = express.Router();

// Create initial admin user endpoint (only works if no admin exists)
router.post('/create-initial-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Supabase admin not configured. Please check environment variables.' 
      });
    }

    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing admins:', checkError);
      return res.status(500).json({ error: 'Failed to check existing administrators' });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(403).json({ 
        error: 'Initial admin already exists. Contact an existing administrator to create additional admin accounts.' 
      });
    }

    // Create user with Supabase Auth using admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        role: 'admin'
      },
      email_confirm: true
    });

    if (error) {
      console.error('Supabase admin creation error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Insert user data into our custom users table
    if (data.user) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: data.user.id,
          name,
          email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting admin user data:', insertError);
        // Try to clean up the Supabase user if database insert fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup Supabase user:', cleanupError);
        }
        return res.status(500).json({ error: 'Failed to create admin user in database' });
      }
    }

    res.status(201).json({
      message: 'Initial admin user created successfully',
      user: {
        id: data.user?.id,
        name,
        email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Initial admin creation error:', error);
    res.status(500).json({ error: 'Failed to create initial admin user' });
  }
});

// Check if initial admin setup is needed
router.get('/setup-status', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Supabase admin not configured. Please check environment variables.' 
      });
    }

    const { data: existingAdmins, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (error) {
      console.error('Error checking setup status:', error);
      return res.status(500).json({ error: 'Failed to check setup status' });
    }

    res.json({
      needsInitialSetup: !existingAdmins || existingAdmins.length === 0,
      hasAdmins: existingAdmins && existingAdmins.length > 0
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

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

    if (!supabase) {
      return res.status(500).json({ 
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