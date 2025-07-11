/*
  # Create Default Consent Form Template

  1. New Content
    - Creates a default consent form template based on the provided HTML structure
    - Adds sections and fields matching the form structure
  2. Security
    - Uses existing RLS policies for consent form templates
*/

-- First, check if the template already exists to avoid duplicates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM consent_form_templates WHERE title = 'Standard Tattoo Consent Form') THEN
    -- Insert the main template
    INSERT INTO consent_form_templates (
      title, 
      description, 
      requires_medical_history,
      is_active
    ) VALUES (
      'Standard Tattoo Consent Form',
      'Standard consent form for tattoo procedures with medical history collection',
      true,
      true
    );

    -- Get the inserted template ID
    WITH template_id AS (
      SELECT id FROM consent_form_templates 
      WHERE title = 'Standard Tattoo Consent Form'
      LIMIT 1
    )
    
    -- Insert Section 1: Your Details
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Your Details', 'Please provide your personal information', 0, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 1
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    ((SELECT id FROM temp_section_id), 'clientName', 'text', 'Name', 'Name (required)', true, 0),
    ((SELECT id FROM temp_section_id), 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    ((SELECT id FROM temp_section_id), 'Phone', 'text', 'Phone', 'Phone (required)', true, 2),
    ((SELECT id FROM temp_section_id), 'clientEmail', 'text', 'Email', 'Email (required)', true, 3),
    ((SELECT id FROM temp_section_id), 'FullAddress', 'textarea', 'Address', 'Full Address', true, 4);
    
    -- Insert Section 2: Your Artist
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Your Artist', 'Select the artist for your procedure', 1, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- No fields needed for artist section as it's handled by the application
    
    -- Insert Section 3: Age & Consent
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Age & Consent', 'Please confirm the following', 2, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 3
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    ((SELECT id FROM temp_section_id), 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', NULL, true, 0),
    ((SELECT id FROM temp_section_id), 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', NULL, true, 1),
    ((SELECT id FROM temp_section_id), 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', NULL, true, 2),
    ((SELECT id FROM temp_section_id), 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', NULL, true, 3, '["Yes", "No"]'),
    ((SELECT id FROM temp_section_id), 'idPhoto', 'image', 'Upload photo ID (optional)', NULL, false, 4);
    
    -- Insert Section 4: Medical History
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Medical History', 'Please provide your medical information', 3, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 4
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order,
      field_options
    ) VALUES
    ((SELECT id FROM temp_section_id), 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', NULL, false, 0, NULL),
    ((SELECT id FROM temp_section_id), 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, false, 1, '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous tattoo or products used", "Fainted or other issues during a previous tattoo", "Issues with tattoo healing", "Other"]'),
    ((SELECT id FROM temp_section_id), 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2, NULL);
    
    -- Insert Section 5: On The Day
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'On The Day', 'Please confirm the following for the day of your procedure', 4, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 5
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order,
      field_options
    ) VALUES
    ((SELECT id FROM temp_section_id), 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.', NULL, true, 0, NULL),
    ((SELECT id FROM temp_section_id), 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', NULL, true, 1, NULL),
    ((SELECT id FROM temp_section_id), 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.', NULL, true, 2, NULL),
    ((SELECT id FROM temp_section_id), 'noAlcohol', 'checkbox', 'I will not get tattooed under the influence of alcohol or drugs.', NULL, true, 3, NULL),
    ((SELECT id FROM temp_section_id), 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', NULL, true, 4, '["Yes", "No"]');
    
    -- Create a similar template for piercings with slight modifications
    INSERT INTO consent_form_templates (
      title, 
      description, 
      requires_medical_history,
      is_active
    ) VALUES (
      'Standard Piercing Consent Form',
      'Standard consent form for piercing procedures with medical history collection',
      true,
      true
    );
    
    -- Get the inserted template ID for piercing
    WITH template_id AS (
      SELECT id FROM consent_form_templates 
      WHERE title = 'Standard Piercing Consent Form'
      LIMIT 1
    )
    
    -- Insert Section 1: Your Details (same as tattoo)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Your Details', 'Please provide your personal information', 0, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 1 (same as tattoo)
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    ((SELECT id FROM temp_section_id), 'clientName', 'text', 'Name', 'Name (required)', true, 0),
    ((SELECT id FROM temp_section_id), 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    ((SELECT id FROM temp_section_id), 'Phone', 'text', 'Phone', 'Phone (required)', true, 2),
    ((SELECT id FROM temp_section_id), 'clientEmail', 'text', 'Email', 'Email (required)', true, 3),
    ((SELECT id FROM temp_section_id), 'FullAddress', 'textarea', 'Address', 'Full Address', true, 4);
    
    -- Insert Section 2: Your Piercer (similar to artist)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Your Piercer', 'Select the piercer for your procedure', 1, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert Section 3: Age & Consent (modified for piercing)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Age & Consent', 'Please confirm the following', 2, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 3 (modified for piercing)
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order,
      field_options
    ) VALUES
    ((SELECT id FROM temp_section_id), 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', NULL, true, 0, NULL),
    ((SELECT id FROM temp_section_id), 'riskConfirm', 'checkbox', 'I fully understand that there are risks with piercing, known and unknown, can lead to injury, including but not limited to infection, scarring, and allergic reactions to jewelry materials, latex gloves, and/or cleaning products. Being aware of the potential risks, I still wish to proceed with the piercing and I freely accept and expressly assume any and all risks.', NULL, true, 1, NULL),
    ((SELECT id FROM temp_section_id), 'liabilityConfirm', 'checkbox', 'I understand neither the Piercer, Venue nor Event Organiser is responsible for any complications that may arise during or after the piercing procedure. I understand that proper aftercare is essential for healing and preventing infection, and I agree to follow all aftercare instructions provided.', NULL, true, 2, NULL),
    ((SELECT id FROM temp_section_id), 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the piercing and give consent in advance to their reproduction in print or electronic form.', NULL, true, 3, '["Yes", "No"]'),
    ((SELECT id FROM temp_section_id), 'idPhoto', 'image', 'Upload photo ID (optional)', NULL, false, 4, NULL);
    
    -- Insert Section 4: Medical History (same as tattoo)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'Medical History', 'Please provide your medical information', 3, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 4 (modified for piercing)
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order,
      field_options
    ) VALUES
    ((SELECT id FROM temp_section_id), 'noIssues', 'checkbox', 'No previous piercing issues or relevant medical issues', NULL, false, 0, NULL),
    ((SELECT id FROM temp_section_id), 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, false, 1, '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous piercing or products used", "Fainted or other issues during a previous piercing", "Issues with piercing healing", "Other"]'),
    ((SELECT id FROM temp_section_id), 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2, NULL);
    
    -- Insert Section 5: On The Day (same as tattoo)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    )
    SELECT id, 'On The Day', 'Please confirm the following for the day of your procedure', 4, true
    FROM template_id
    RETURNING id AS section_id INTO TEMPORARY temp_section_id;
    
    -- Insert fields for Section 5 (modified for piercing)
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order,
      field_options
    ) VALUES
    ((SELECT id FROM temp_section_id), 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the piercer for any healing issues. I understand that should I have any concerns they will be relayed to the piercer immediately for further advice.', NULL, true, 0, NULL),
    ((SELECT id FROM temp_section_id), 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', NULL, true, 1, NULL),
    ((SELECT id FROM temp_section_id), 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my piercer and my appointment may be cancelled.', NULL, true, 2, NULL),
    ((SELECT id FROM temp_section_id), 'noAlcohol', 'checkbox', 'I will not get pierced under the influence of alcohol or drugs.', NULL, true, 3, NULL),
    ((SELECT id FROM temp_section_id), 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', NULL, true, 4, '["Yes", "No"]');
  END IF;
END $$;