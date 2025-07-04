const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        e.id,
        e.name,
        e.description,
        e.event_slug,
        e.start_date,
        e.end_date,
        e.location,
        e.venue,
        e.max_attendees,
        e.status,
        e.created_at,
        u.name as event_manager_name,
        u.email as event_manager_email
      FROM events e
      LEFT JOIN users u ON e.event_manager_id = u.id
      ORDER BY e.start_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await query(`
      SELECT 
        e.id,
        e.name,
        e.description,
        e.event_slug,
        e.start_date,
        e.end_date,
        e.location,
        e.venue,
        e.max_attendees,
        e.status,
        e.created_at,
        u.name as event_manager_name,
        u.email as event_manager_email
      FROM events e
      LEFT JOIN users u ON e.event_manager_id = u.id
      WHERE e.event_slug = $1
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (protected route - Master Admins only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      event_slug,
      start_date,
      end_date,
      location,
      venue,
      max_attendees,
      eventManagerName,
      eventManagerEmail
    } = req.body;

    console.log('📝 Creating event with data:', {
      name,
      event_slug,
      start_date,
      end_date,
      location,
      eventManagerName,
      eventManagerEmail
    });

    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return res.status(500).json({ 
        error: 'Authentication service not configured. Please check Supabase credentials in backend/.env file.',
        details: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
      });
    }

    // Check if user is Master Admin using req.user.role directly
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only Master Admins can create events' });
    }

    // Validate required fields
    if (!name || !event_slug || !start_date || !end_date || !location) {
      return res.status(400).json({ error: 'Missing required fields: name, event_slug, start_date, end_date, location' });
    }

    if (!eventManagerName || !eventManagerEmail) {
      return res.status(400).json({ error: 'Event Manager name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(eventManagerEmail)) {
      return res.status(400).json({ error: 'Invalid email format for Event Manager' });
    }

    // Check if slug already exists
    const existingEvent = await query('SELECT id FROM events WHERE event_slug = $1', [event_slug]);

    if (existingEvent.rows.length > 0) {
      return res.status(400).json({ error: 'Event slug already exists' });
    }

    let eventManagerId = null;

    // Check if Event Manager already exists
    const existingManager = await query('SELECT id, role FROM users WHERE email = $1', [eventManagerEmail]);

    if (existingManager.rows.length > 0) {
      // User exists, update their role to event_manager if needed
      const existingUser = existingManager.rows[0];
      eventManagerId = existingUser.id;

      if (existingUser.role !== 'event_manager' && existingUser.role !== 'admin') {
        await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', ['event_manager', existingUser.id]);
      }
      
      console.log(`✅ Using existing user as Event Manager: ${eventManagerEmail}, ID: ${eventManagerId}`);
    } else {
      // Create new Event Manager user
      console.log('🔄 Creating new Event Manager user...');
      
      try {
        // Generate a secure temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '1!';
        
        console.log(`🔐 Attempting to create Supabase user for: ${eventManagerEmail}`);
        
        const { data, error } = await supabase.auth.admin.createUser({
          email: eventManagerEmail,
          password: tempPassword,
          user_metadata: {
            name: eventManagerName,
            role: 'event_manager'
          },
          email_confirm: true
        });

        if (error) {
          console.error('❌ Error creating Supabase user:', error);
          
          // Handle specific Supabase errors
          if (error.message.includes('User already registered')) {
            return res.status(400).json({ 
              error: 'A user with this email already exists in the authentication system' 
            });
          }
          
          if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('service_role')) {
            console.error('❌ Invalid Supabase service role key');
            return res.status(500).json({ 
              error: 'Authentication service configuration error. Please check SUPABASE_SERVICE_ROLE_KEY in backend/.env file.',
              details: 'The service role key should be different from the anon key and can be found in your Supabase project settings under API Keys.'
            });
          }
          
          throw new Error(`Supabase user creation failed: ${error.message}`);
        }

        if (!data.user || !data.user.id) {
          throw new Error('Supabase user creation returned no user data');
        }

        eventManagerId = data.user.id;
        console.log(`✅ Successfully created Supabase user with ID: ${eventManagerId}`);

        // Insert into our users table
        try {
          await query(`
            INSERT INTO users (id, name, email, role, created_at, updated_at) 
            VALUES ($1, $2, $3, 'event_manager', NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              role = EXCLUDED.role,
              updated_at = NOW()
          `, [eventManagerId, eventManagerName, eventManagerEmail]);
          
          console.log(`✅ Successfully inserted user into users table: ${eventManagerId}`);
        } catch (dbError) {
          console.error('❌ Error inserting into users table:', dbError);
          // Try to clean up the Supabase user if database insert fails
          try {
            await supabase.auth.admin.deleteUser(eventManagerId);
            console.log('🧹 Cleaned up Supabase user after database error');
          } catch (cleanupError) {
            console.error('❌ Failed to cleanup Supabase user:', cleanupError);
          }
          throw new Error(`Database user creation failed: ${dbError.message}`);
        }

        console.log(`🎉 Created Event Manager account for ${eventManagerEmail} with temporary password`);
      } catch (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        
        // Return more specific error messages
        if (supabaseError.message.includes('Invalid API key') || supabaseError.message.includes('JWT') || supabaseError.message.includes('service_role')) {
          return res.status(500).json({ 
            error: 'Authentication service configuration error. Please check SUPABASE_SERVICE_ROLE_KEY in backend/.env file.',
            details: 'The service role key should be different from the anon key and can be found in your Supabase project settings under API Keys.'
          });
        }
        
        if (supabaseError.message.includes('network') || supabaseError.message.includes('timeout')) {
          return res.status(500).json({ 
            error: 'Network error connecting to authentication service. Please try again.' 
          });
        }
        
        return res.status(500).json({ 
          error: `Event Manager creation failed: ${supabaseError.message}` 
        });
      }
    }

    // Insert new event with Event Manager
    try {
      console.log(`📅 Inserting new event with Event Manager ID: ${eventManagerId}`);
      const result = await query(`
        INSERT INTO events (
          name, description, event_slug, start_date, end_date, 
          location, venue, max_attendees, event_manager_id, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', NOW(), NOW())
        RETURNING id
      `, [name, description, event_slug, start_date, end_date, location, venue, max_attendees || 500, eventManagerId]);

      console.log(`🎉 Successfully created event with ID: ${result.rows[0].id}`);

      res.status(201).json({
        message: 'Event created successfully',
        eventId: result.rows[0].id,
        eventManagerId: eventManagerId,
        note: existingManager.rows.length > 0 ? 
          'Event assigned to existing Event Manager' : 
          'New Event Manager account created. They will receive login credentials via email.'
      });
    } catch (eventError) {
      console.error('❌ Error inserting event:', eventError);
      
      if (eventError.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          error: 'Event with this slug already exists' 
        });
      }
      
      throw new Error(`Event creation failed: ${eventError.message}`);
    }
  } catch (error) {
    console.error('❌ Error creating event:', error);
    console.error('Stack trace:', error.stack);
    
    // Return a more specific error message
    let errorMessage = 'Failed to create event';
    let statusCode = 500;
    
    if (error.message.includes('Missing required fields')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('Invalid email format')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('already exists')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('Supabase') || error.message.includes('Authentication service')) {
      errorMessage = 'Failed to create Event Manager account. Please check Supabase configuration in backend/.env file.';
      statusCode = 500;
    } else if (error.message.includes('Database')) {
      errorMessage = 'Database error occurred while creating event.';
    } else if (error.message.includes('Event Manager creation')) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;