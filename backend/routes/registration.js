const express = require('express');
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get registration data by token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token and get registration data
    const { data: tokenData, error: tokenError } = await supabase
      .from('registration_tokens')
      .select(`
        token,
        expires_at,
        used_at,
        application_id,
        applications!inner(
          id,
          applicant_name,
          applicant_email,
          application_type,
          event_id,
          events!inner(
            name
          )
        )
      `)
      .eq('token', token)
      .single();
      
    if (tokenError) {
      console.error('Error fetching registration token:', tokenError);
      return res.status(404).json({ error: 'Invalid or expired registration token' });
    }
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid or expired registration token' });
    }
    
    // Get registration requirements
    const { data: requirementsData, error: requirementsError } = await supabase
      .from('registration_requirements')
      .select('*')
      .eq('event_id', tokenData.applications.event_id)
      .eq('application_type', tokenData.applications.application_type)
      .maybeSingle();
      
    if (requirementsError) {
      console.error('Error fetching registration requirements:', requirementsError);
    }
    
    // Get payment settings
    const { data: paymentSettings, error: paymentError } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('event_id', tokenData.applications.event_id)
      .maybeSingle();
      
    if (paymentError) {
      console.error('Error fetching payment settings:', paymentError);
    }

    const registration = {
      token: tokenData.token,
      expires_at: tokenData.expires_at,
      used_at: tokenData.used_at,
      application_id: tokenData.application_id,
      applicant_name: tokenData.applications.applicant_name,
      applicant_email: tokenData.applications.applicant_email,
      application_type: tokenData.applications.application_type,
      event_id: tokenData.applications.event_id,
      event_name: tokenData.applications.events.name,
      requires_payment: requirementsData?.requires_payment || false,
      payment_amount: requirementsData?.payment_amount || 0,
      agreement_text: requirementsData?.agreement_text || '',
      profile_deadline_days: requirementsData?.profile_deadline_days || 30,
      cash_enabled: paymentSettings?.cash_enabled || false,
      cash_details: paymentSettings?.cash_details || '',
      bank_transfer_enabled: paymentSettings?.bank_transfer_enabled || false,
      bank_details: paymentSettings?.bank_details || '',
      stripe_enabled: paymentSettings?.stripe_enabled || false,
      allow_installments: paymentSettings?.allow_installments || false
    };

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
    const { data: tokenData, error: tokenError } = await supabase
      .from('registration_tokens')
      .select(`
        *,
        applications!inner(
          user_id,
          event_id,
          application_type
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('used_at', null)
      .single();
      
    if (tokenError) {
      console.error('Error validating token:', tokenError);
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    // Create a transaction-like sequence of operations
    try {
      // Create or update client record
      let clientId = tokenData.applications.user_id;
      
      if (clientId) {
        // Update existing client record
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({
            id: clientId,
            name: registration_data.applicant_name || '',
            email: registration_data.applicant_email || '',
            emergency_contact_name: registration_data.emergency_contact_name,
            emergency_contact_phone: registration_data.emergency_contact_phone,
            medical_conditions: registration_data.medical_conditions || '',
            allergies: registration_data.allergies || '',
            medications: registration_data.medications || '',
            updated_at: new Date().toISOString()
          });
          
        if (clientError) {
          console.error('Error updating client record:', clientError);
          throw new Error('Failed to update client record');
        }
      }

      // Create registration submission
      const profileDeadline = new Date();
      profileDeadline.setDate(profileDeadline.getDate() + 30); // 30 days from now
      
      const { data: registrationData, error: registrationError } = await supabase
        .from('registration_submissions')
        .insert({
          application_id: tokenData.application_id,
          client_id: clientId,
          confirmed_details: registration_data,
          agreement_accepted: registration_data.agreement_accepted,
          agreement_accepted_at: registration_data.agreement_accepted ? new Date().toISOString() : null,
          payment_method: registration_data.payment_method,
          payment_amount: 0, // Payment amount will be set based on requirements
          submitted_at: new Date().toISOString(),
          profile_deadline: profileDeadline.toISOString()
        })
        .select('id')
        .single();
        
      if (registrationError) {
        console.error('Error creating registration submission:', registrationError);
        throw new Error('Failed to create registration submission');
      }

      // Create ticket entry
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id: tokenData.applications.event_id,
          client_id: clientId,
          ticket_type: tokenData.applications.application_type,
          price_gbp: 0, // Price will be updated based on payment
          purchase_date: new Date().toISOString(),
          status: 'active'
        });
        
      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw new Error('Failed to create ticket');
      }

      // Mark token as used
      const { error: tokenUpdateError } = await supabase
        .from('registration_tokens')
        .update({
          used_at: new Date().toISOString()
        })
        .eq('id', tokenData.id);
        
      if (tokenUpdateError) {
        console.error('Error updating token:', tokenUpdateError);
        throw new Error('Failed to update token');
      }

      // Update application status
      const { error: applicationError } = await supabase
        .from('applications')
        .update({
          registration_completed: new Date().toISOString()
        })
        .eq('id', tokenData.application_id);
        
      if (applicationError) {
        console.error('Error updating application:', applicationError);
        throw new Error('Failed to update application');
      }

      res.json({
        message: 'Registration completed successfully',
        registration_id: registrationData.id
      });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return res.status(500).json({ error: transactionError.message || 'Failed to complete registration' });
    }

  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

module.exports = router;