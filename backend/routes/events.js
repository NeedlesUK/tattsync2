const express = require('express');
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        event_slug,
        start_date,
        end_date,
        location,
        venue,
        max_attendees,
        status,
        created_at,
        event_manager_id,
        users:event_manager_id (name, email)
      `)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Format the response to match the expected structure
    const formattedData = data.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      event_slug: event.event_slug,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      venue: event.venue,
      max_attendees: event.max_attendees,
      status: event.status,
      created_at: event.created_at,
      event_manager_name: event.users?.name,
      event_manager_email: event.users?.email
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        event_slug,
        start_date,
        end_date,
        location,
        venue,
        max_attendees,
        status,
        created_at,
        event_manager_id,
        users:event_manager_id (name, email)
      `)
      .eq('event_slug', slug)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Format the response to match the expected structure
    const formattedData = {
      id: data.id,
      name: data.name,
      description: data.description,
      event_slug: data.event_slug,
      start_date: data.start_date,
      end_date: data.end_date,
      location: data.location,
      venue: data.venue,
      max_attendees: data.max_attendees,
      status: data.status,
      created_at: data.created_at,
      event_manager_name: data.users?.name,
      event_manager_email: data.users?.email
    };

    res.json(formattedData);
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

    // Check if user is Master Admin
    if (req.user.role !== 'admin') {
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
    const { data: existingEvent, error: slugCheckError } = await supabase
      .from('events')
      .select('id')
      .eq('event_slug', event_slug)
      .maybeSingle();
      
    if (slugCheckError) {
      console.error('Error checking existing event:', slugCheckError);
      return res.status(500).json({ error: 'Failed to check if event exists' });
    }

    if (existingEvent) {
      return res.status(400).json({ error: 'Event slug already exists' });
    }

    let eventManagerId = null;

    // Check if Event Manager already exists
    const { data: existingManager, error: managerCheckError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', eventManagerEmail)
      .maybeSingle();
      
    if (managerCheckError) {
      console.error('Error checking existing manager:', managerCheckError);
      return res.status(500).json({ error: 'Failed to check if manager exists' });
    }

    if (existingManager) {
      // User exists, update their role to event_manager if needed
      eventManagerId = existingManager.id;

      if (existingManager.role !== 'event_manager' && existingManager.role !== 'admin') {
        const { error: updateRoleError } = await supabase
          .from('users')
          .update({ 
            role: 'event_manager', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingManager.id);
          
        if (updateRoleError) {
          console.error('Error updating manager role:', updateRoleError);
          return res.status(500).json({ error: 'Failed to update manager role' });
        }
      }
      
      console.log(`✅ Using existing user as Event Manager: ${eventManagerEmail}, ID: ${existingManager.id}`);
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

        if (!data?.user?.id) {
          throw new Error('Supabase user creation returned no user data');
        }

        eventManagerId = data.user.id;
        console.log(`✅ Successfully created Supabase user with ID: ${eventManagerId}`);

        // Insert into our users table
        try {
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: eventManagerId,
              name: eventManagerName,
              email: eventManagerEmail,
              role: 'event_manager',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error inserting into users table:', insertError);
            // Try to clean up the Supabase user if database insert fails
            try {
              await supabase.auth.admin.deleteUser(eventManagerId);
              console.log('🧹 Cleaned up Supabase user after database error');
            } catch (cleanupError) {
              console.error('❌ Failed to cleanup Supabase user:', cleanupError);
            }
            throw new Error(`Database user creation failed: ${insertError.message}`);
          }
          
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
      
      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          name,
          description,
          event_slug,
          start_date,
          end_date,
          location,
          venue,
          max_attendees: max_attendees || 500,
          event_manager_id: eventManagerId,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (insertError) {
        console.error('Error inserting event:', insertError);
        
        if (insertError.code === '23505') { // Unique constraint violation
          return res.status(400).json({ 
            error: 'Event with this slug already exists' 
          });
        }
        
        throw new Error(`Event creation failed: ${insertError.message}`);
      }

      console.log(`🎉 Successfully created event with ID: ${newEvent.id}`);

      res.status(201).json({
        message: 'Event created successfully',
        eventId: newEvent.id,
        eventManagerId: eventManagerId,
        note: existingManager ? 
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