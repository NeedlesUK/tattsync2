const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all applications (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is Master Admin - they should not access applications
    const userResult = await query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const userRole = userResult.rows[0]?.role;

    if (userRole === 'admin') {
      return res.status(403).json({ 
        error: 'Master Admins do not manage applications directly. Applications are managed by Event Managers.' 
      });
    }

    // For Event Managers, only show applications for their events
    let applicationsQuery = `
      SELECT 
        a.id,
        a.event_id,
        a.application_type,
        a.status,
        a.experience_years,
        a.portfolio_url,
        a.created_at,
        u.name as applicant_name,
        u.email as applicant_email,
        e.name as event_name
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN events e ON a.event_id = e.id
    `;

    let queryParams = [];

    if (userRole === 'event_manager') {
      applicationsQuery += ' WHERE e.event_manager_id = $1';
      queryParams.push(req.user.userId);
    } else {
      // For regular users, only show their own applications
      applicationsQuery += ' WHERE a.user_id = $1';
      queryParams.push(req.user.userId);
    }

    applicationsQuery += ' ORDER BY a.created_at DESC';

    const result = await query(applicationsQuery, queryParams);
    res.json(result.rows);
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
    const existingApplication = await query(
      'SELECT id FROM applications WHERE user_id = $1 AND event_id = $2',
      [userId, event_id]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this event' });
    }

    // Insert new application
    const result = await query(`
      INSERT INTO applications (
        user_id, event_id, application_type, experience_years, 
        portfolio_url, additional_info, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING id
    `, [userId, event_id, application_type, experience_years, portfolio_url, additional_info]);

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.rows[0].id
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
    const userResult = await query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const userRole = userResult.rows[0]?.role;

    if (userRole !== 'event_manager') {
      return res.status(403).json({ error: 'Only Event Managers can update application status' });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if the application belongs to an event managed by this user
    const applicationCheck = await query(`
      SELECT a.id 
      FROM applications a
      JOIN events e ON a.event_id = e.id
      WHERE a.id = $1 AND e.event_manager_id = $2
    `, [id, req.user.userId]);

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or you do not have permission to modify it' });
    }

    // Update application status
    const result = await query(
      'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;