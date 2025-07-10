const database = require('../config/database');
const emailService = require('../services/emailService');

// Submit a new consent form
const submitConsentForm = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { 
      form_id, 
      event_id, 
      client_id, 
      artist_id, 
      submission_data,
      procedure_type
    } = req.body;
    
    if (!form_id || !submission_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert form submission into database
    const { data: submissionData, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id,
        client_id: client_id || null,
        submission_data
      })
      .select()
      .single();
      
    if (submissionError) {
      console.error('Error inserting form submission:', submissionError);
      return res.status(500).json({ error: 'Failed to save form submission' });
    }
    
    // Create artist-client consent record
    if (artist_id) {
      const { error: consentError } = await supabase
        .from('artist_client_consents')
        .insert({
          artist_id,
          client_id: client_id || null,
          event_id,
          submission_id: submissionData.id,
          procedure_type: procedure_type || 'tattoo',
          created_at: new Date().toISOString()
        });
        
      if (consentError) {
        console.error('Error creating artist-client consent:', consentError);
        // Continue anyway, as the form submission was successful
      }
    }
    
    // Send confirmation email to client
    if (submission_data.clientEmail) {
      try {
        // Get artist details
        let artistName = submission_data.artistName || 'Your Artist';
        let artistEmail = submission_data.artistEmail || '';
        
        if (artist_id && (!artistName || !artistEmail)) {
          const { data: artistData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', artist_id)
            .single();
            
          if (artistData) {
            artistName = artistData.name;
            artistEmail = artistData.email;
          }
        }
        
        // Send confirmation email
        await emailService.sendConsentConfirmationEmail(
          submission_data.clientEmail,
          submission_data.clientName,
          artistName,
          submission_data
        );
        
        // Send aftercare email
        await emailService.sendAftercareEmail(
          submission_data.clientEmail,
          submission_data.clientName,
          artistName,
          artistEmail
        );
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Continue anyway, as the form submission was successful
      }
    }
    
    // Return success response
    return res.status(201).json({ 
      success: true, 
      message: 'Consent form submitted successfully',
      data: {
        submission_id: submissionData.id
      }
    });
  } catch (error) {
    console.error('Error in submitConsentForm:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get consent form by ID
const getConsentForm = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('consent_forms')
      .select(`
        id,
        title,
        description,
        requires_medical_history,
        is_active,
        event_id,
        consent_form_sections (
          id,
          title,
          description,
          display_order,
          is_required,
          consent_form_fields (
            id,
            field_name,
            field_type,
            field_label,
            field_placeholder,
            field_options,
            is_required,
            display_order
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching consent form:', error);
      return res.status(404).json({ error: 'Consent form not found' });
    }
    
    // Sort sections by display_order
    if (data.consent_form_sections) {
      data.consent_form_sections.sort((a, b) => a.display_order - b.display_order);
      
      // Sort fields within each section by display_order
      data.consent_form_sections.forEach(section => {
        if (section.consent_form_fields) {
          section.consent_form_fields.sort((a, b) => a.display_order - b.display_order);
        }
      });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error in getConsentForm:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get consent form by QR code
const getConsentFormByQrCode = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { code } = req.params;
    
    // Get QR code data
    const { data: qrData, error: qrError } = await supabase
      .from('consent_qr_codes')
      .select('*, consent_forms(*)')
      .eq('code', code)
      .single();
      
    if (qrError || !qrData) {
      console.error('Error fetching QR code data:', qrError);
      return res.status(404).json({ error: 'QR code not found or invalid' });
    }
    
    // Check if QR code has expired
    if (qrData.expires_at && new Date(qrData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'QR code has expired' });
    }
    
    // Increment scan count
    await supabase
      .from('consent_qr_codes')
      .update({ scan_count: (qrData.scan_count || 0) + 1 })
      .eq('id', qrData.id);
    
    // Get event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', qrData.event_id)
      .single();
      
    if (eventError || !eventData) {
      console.error('Error fetching event data:', eventError);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is published
    if (eventData.status !== 'published') {
      return res.status(400).json({ error: 'Event is not active' });
    }
    
    // Return QR code data with form and event info
    return res.json({
      code: qrData.code,
      event_id: qrData.event_id,
      event_name: eventData.name,
      form_id: qrData.form_id,
      form_title: qrData.consent_forms?.title || 'Consent Form',
      expires_at: qrData.expires_at,
      is_valid: true
    });
  } catch (error) {
    console.error('Error in getConsentFormByQrCode:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get consent form template by ID
const getConsentFormTemplate = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('consent_form_templates')
      .select(`
        id,
        title,
        description,
        requires_medical_history,
        is_active,
        consent_form_template_sections (
          id,
          title,
          description,
          display_order,
          is_required,
          consent_form_template_fields (
            id,
            field_name,
            field_type,
            field_label,
            field_placeholder,
            field_options,
            is_required,
            display_order
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching consent form template:', error);
      return res.status(404).json({ error: 'Consent form template not found' });
    }
    
    // Sort sections by display_order
    if (data.consent_form_template_sections) {
      data.consent_form_template_sections.sort((a, b) => a.display_order - b.display_order);
      
      // Sort fields within each section by display_order
      data.consent_form_template_sections.forEach(section => {
        if (section.consent_form_template_fields) {
          section.consent_form_template_fields.sort((a, b) => a.display_order - b.display_order);
        }
      });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error in getConsentFormTemplate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all consent form templates
const getAllConsentFormTemplates = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { data, error } = await supabase
      .from('consent_form_templates')
      .select('id, title, description, requires_medical_history, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching consent form templates:', error);
      return res.status(500).json({ error: 'Failed to fetch consent form templates' });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error in getAllConsentFormTemplates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all aftercare templates
const getAllAftercareTemplates = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { data, error } = await supabase
      .from('aftercare_templates')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching aftercare templates:', error);
      return res.status(500).json({ error: 'Failed to fetch aftercare templates' });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error in getAllAftercareTemplates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get aftercare template by ID
const getAftercareTemplate = async (req, res) => {
  try {
    const { supabase } = database;
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('aftercare_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching aftercare template:', error);
      return res.status(404).json({ error: 'Aftercare template not found' });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error in getAftercareTemplate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitConsentForm,
  getConsentForm,
  getConsentFormByQrCode,
  getConsentFormTemplate,
  getAllConsentFormTemplates,
  getAllAftercareTemplates,
  getAftercareTemplate
};