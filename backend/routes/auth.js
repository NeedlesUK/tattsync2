const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, supabase } = require('../config/database');
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

    // Use Supabase Auth if available
    if (supabase) {
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

      // Insert user data into our custom users table
      if (data.user) {
        try {
          await query(`
            INSERT INTO users (id, name, email, role, created_at) 
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              role = EXCLUDED.role
          `, [data.user.id, name, email, role]);
        } catch (dbError) {
          console.error('Error inserting user data:', dbError);
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
    } else {
      // Fallback to custom auth
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await query(
        'INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
        [name, email, hashedPassword, role]
      );

      const token = jwt.sign(
        { userId: result.rows[0].id, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.rows[0].id,
          name,
          email,
          role
        }
      });
    }
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

    // Use Supabase Auth if available
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user data from our custom table
      let userData = null;
      try {
        const userResult = await query('SELECT * FROM users WHERE id = $1', [data.user.id]);
        userData = userResult.rows[0];
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
    } else {
      // Fallback to custom auth
      const result = await query(
        'SELECT id, name, email, password, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;