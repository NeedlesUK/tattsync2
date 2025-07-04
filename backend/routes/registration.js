const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get registration data by token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token and get registration data
    const result = await query(`
      SELECT 
        rt.token,
        rt.expires_at,
        rt.used_at,
        a.id as application_id,
        a.applicant_name,
        a.applicant_email,
        a.application_type,
        a.event_id,
        e.name as event_name,
        rr.requires_payment,
        rr.payment_amount,
        rr.agreement_text,
        rr.profile_deadline_days,
        ps.cash_enabled,
        ps.cash_details,
        ps.bank_transfer_enabled,
        ps.bank_details,
        ps.stripe_enabled,
        ps.allow_installments
      FROM registration_tokens rt
      JOIN applications a ON a.id = rt.application_id
      JOIN events e ON e.id = a.event_id
      LEFT JOIN registration_requirements rr ON rr.event_id = a.event_id AND rr.application_type = a.application_type
      LEFT JOIN payment_settings ps ON ps.event_id = a.event_id
      WHERE rt.token = $1
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired registration token' });
    }

    const registration = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(registration.expires_at)) {
      return res.status(410).json({ error: 'Registration link has expired' });
    }

    // Check if token has already been used
    if (registration.used_at) {
      return res.status(409).json({ error: 'Registration has already been completed' });
    }

    // Return registration data
    res.json({
      token: registration.token,
      application: {
        id: registration.application_id,
        applicant_name: registration.applicant_name,
        applicant_email: registration.applicant_email,
        application_type: registration.application_type,
        event_name: registration.event_name,
        event_id: registration.event_id
      },
      requirements: {
        requires_payment: registration.requires_payment || false,
        payment_amount: parseFloat(registration.payment_amount) || 0,
        agreement_text: registration.agreement_text || 'I agree to participate in this event.',
        profile_deadline_days: registration.profile_deadline_days || 30
      },
      payment_settings: {
        cash_enabled: registration.cash_enabled || false,
        cash_details: registration.cash_details || '',
        bank_transfer_enabled: registration.bank_transfer_enabled || false,
        bank_details: registration.bank_details || '',
        stripe_enabled: registration.stripe_enabled || false,
        allow_installments: registration.allow_installments || false
      }
    });

  } catch (error) {
    console.error('Error fetching registration data:', error);
    res.status(500).json({ error: 'Failed to fetch registration data' });
  }
});

// Complete registration
router.post('/complete', async (req, res) => {
  try {
    const {
      token,
      registration_data
    } = req.body;

    // Validate token
    const tokenResult = await query(`
      SELECT rt.*, a.user_id, a.event_id, a.application_type
      FROM registration_tokens rt
      JOIN applications a ON a.id = rt.application_id
      WHERE rt.token = $1 AND rt.expires_at > NOW() AND rt.used_at IS NULL
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    const tokenData = tokenResult.rows[0];

    // Start transaction
    await query('BEGIN');

    try {
      // Create or update client record
      let clientId = tokenData.user_id;
      
      if (tokenData.user_id) {
        // Update existing client record
        await query(`
          INSERT INTO clients (
            id, name, email, emergency_contact_name, emergency_contact_phone,
            medical_conditions, allergies, medications, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id) DO UPDATE SET
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone,
            medical_conditions = EXCLUDED.medical_conditions,
            allergies = EXCLUDED.allergies,
            medications = EXCLUDED.medications,
            updated_at = NOW()
        `, [
          tokenData.user_id,
          registration_data.applicant_name || '',
          registration_data.applicant_email || '',
          registration_data.emergency_contact_name,
          registration_data.emergency_contact_phone,
          registration_data.medical_conditions || '',
          registration_data.allergies || '',
          registration_data.medications || ''
        ]);
      }

      // Create registration submission
      const registrationResult = await query(`
        INSERT INTO registration_submissions (
          application_id, client_id, confirmed_details, agreement_accepted,
          agreement_accepted_at, payment_method, payment_amount, submitted_at,
          profile_deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING id
      `, [
        tokenData.application_id,
        clientId,
        JSON.stringify(registration_data),
        registration_data.agreement_accepted,
        registration_data.agreement_accepted ? new Date() : null,
        registration_data.payment_method,
        0, // Payment amount will be set based on requirements
        new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
      ]);

      const registrationId = registrationResult.rows[0].id;

      // Create ticket entry
      await query(`
        INSERT INTO tickets (event_id, client_id, ticket_type, price_gbp, purchase_date, status)
        VALUES ($1, $2, $3, $4, NOW(), 'active')
      `, [
        tokenData.event_id,
        clientId,
        tokenData.application_type,
        0 // Price will be updated based on payment
      ]);

      // Mark token as used
      await query(`
        UPDATE registration_tokens 
        SET used_at = NOW() 
        WHERE id = $1
      `, [tokenData.id]);

      // Update application status
      await query(`
        UPDATE applications 
        SET registration_completed = NOW()
        WHERE id = $1
      `, [tokenData.application_id]);

      // Commit transaction
      await query('COMMIT');

      res.json({
        message: 'Registration completed successfully',
        registration_id: registrationId
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

module.exports = router;