const express = require('express');
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all applications (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is Master Admin - they should not access applications
    const userRole = req.user.role;

    if (userRole === 'admin') {
      return res.status(403).json({ 
        error: 'Master Admins do not manage applications directly. Applications are managed by Event Managers.' 
      });
    }

    let query = supabase
      .from('applications')
      .select(`
        id,
        event_id,
        application_type,
        status,
        experience_years,
        portfolio_url,
        created_at,
        applicant_name,
        applicant_email,
        events(name)
      `);
      
    if (userRole === 'event_manager') {
      // For Event Managers, only show applications for their events
      query = query.eq('events.event_manager_id', req.user.userId);
    } else {
      // For regular users, only show their own applications 
      query = query.eq('user_id', req.user.userId);
    }

    // Order by created_at
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
    
    // Format the response to match the expected structure
    const formattedData = data.map(app => ({
      id: app.id,
      event_id: app.event_id,
      application_type: app.application_type,
      status: app.status,
      experience_years: app.experience_years,
      portfolio_url: app.portfolio_url,
      created_at: app.created_at,
      applicant_name: app.applicant_name,
      applicant_email: app.applicant_email,
      event_name: app.events?.name
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Create new application (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      event_id,
      application_type,
      experience_years,
      portfolio_url,
      additional_info
    } = req.body;

    const userId = req.user.userId;

    // Validate required fields
    if (!event_id || !application_type) {
      return res.status(400).json({ error: 'Event ID and application type are required' });
    }

    // Check if user already applied for this event
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', event_id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return res.status(500).json({ error: 'Failed to check existing application' });
    }

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this event' });
    }

    // Insert new application
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        event_id,
        application_type,
        experience_years,
        portfolio_url,
        additional_info,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (insertError) {
      console.error('Error creating application:', insertError);
      return res.status(500).json({ error: 'Failed to submit application' });
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: newApplication.id
    });

  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Update application status (protected route - event managers only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is authorized to update applications
    const userRole = req.user.role;

    if (userRole !== 'event_manager') {
      return res.status(403).json({ error: 'Only Event Managers can update application status' });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if the application belongs to an event managed by this user
    const { data: applicationCheck, error: checkError } = await supabase
      .from('applications')
      .select('id, events!inner(event_manager_id)')
      .eq('id', id)
      .eq('events.event_manager_id', req.user.userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking application:', checkError);
      return res.status(500).json({ error: 'Failed to verify application' });
    }

    if (!applicationCheck) {
      return res.status(404).json({ error: 'Application not found or you do not have permission to modify it' });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return res.status(500).json({ error: 'Failed to update application status' });
    }

    res.json({ message: 'Application status updated successfully' });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;