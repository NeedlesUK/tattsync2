/*
  # Create Default Consent Templates

  1. New Data
    - Default tattoo consent form template
    - Default piercing consent form template
    - Default aftercare email templates
  2. Structure
    - Templates include all sections and fields from the provided HTML
*/

-- Create default tattoo consent form template if it doesn't exist
DO $$
DECLARE
  template_id INT;
  section_id INT;
BEGIN
  -- Check if template already exists
  SELECT id INTO template_id FROM consent_form_templates 
  WHERE title = 'Standard Tattoo Consent Form' LIMIT 1;
  
  -- If template doesn't exist, create it
  IF template_id IS NULL THEN
    INSERT INTO consent_form_templates (
      title, 
      description, 
      requires_medical_history,
      is_active
    ) VALUES (
      'Standard Tattoo Consent Form',
      'Standard medical history and consent form for tattoo procedures',
      true,
      true
    ) RETURNING id INTO template_id;
    
    -- Create sections and fields
    
    -- Section 1: Your Details
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Your Details',
      'Please provide your personal information',
      0,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 1
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'clientName', 'text', 'Name', 'Name (required)', true, 0),
    (section_id, 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    (section_id, 'Phone', 'text', 'Phone', 'Phone (required)', true, 2),
    (section_id, 'clientEmail', 'text', 'Email', 'Email (required)', true, 3),
    (section_id, 'FullAddress', 'textarea', 'Address', 'Full Address', true, 4);
    
    -- Section 2: Your Artist
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Your Artist',
      'Select the artist for your procedure',
      1,
      true
    ) RETURNING id INTO section_id;
    
    -- No fields needed for artist section as it's handled by the application
    
    -- Section 3: Age & Consent
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Age & Consent',
      'Please confirm the following',
      2,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 3
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', NULL, true, 0),
    (section_id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', NULL, true, 1),
    (section_id, 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', NULL, true, 2),
    (section_id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', NULL, true, 3),
    (section_id, 'idPhoto', 'image', 'Upload photo ID (optional)', NULL, false, 4);
    
    -- Set options for radio buttons
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY['Yes', 'No']
    WHERE section_id = section_id AND field_name = 'mediaRelease';
    
    -- Section 4: Medical History
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Medical History',
      'Please provide your medical information',
      3,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 4
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', NULL, false, 0),
    (section_id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, false, 1),
    (section_id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2);
    
    -- Set options for medical issues checkbox
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY[
      'Diabetes',
      'Epilepsy',
      'Haemophilia',
      'Pregnant or breast feeding',
      'Taking blood thinning medication',
      'Skin condition',
      'Heart condition',
      'Recipient of an organ or bone marrow transplant',
      'Any blood-borne pathogens',
      'Any transmittable diseases',
      'Any allergies',
      'Had any adverse reaction to a previous tattoo or products used',
      'Fainted or other issues during a previous tattoo',
      'Issues with tattoo healing',
      'Other'
    ]
    WHERE section_id = section_id AND field_name = 'medicalIssues';
    
    -- Section 5: On The Day
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'On The Day',
      'Please confirm the following for the day of your procedure',
      4,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 5
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.', NULL, true, 0),
    (section_id, 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', NULL, true, 1),
    (section_id, 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.', NULL, true, 2),
    (section_id, 'noAlcohol', 'checkbox', 'I will not get tattooed under the influence of alcohol or drugs.', NULL, true, 3),
    (section_id, 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', NULL, true, 4);
    
    -- Set options for marketing consent radio buttons
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY['Yes', 'No']
    WHERE section_id = section_id AND field_name = 'marketingConsent';
    
    RAISE NOTICE 'Created default tattoo consent form template';
  ELSE
    RAISE NOTICE 'Default tattoo consent form template already exists';
  END IF;
END $$;

-- Create default piercing consent form template if it doesn't exist
DO $$
DECLARE
  template_id INT;
  section_id INT;
BEGIN
  -- Check if template already exists
  SELECT id INTO template_id FROM consent_form_templates 
  WHERE title = 'Standard Piercing Consent Form' LIMIT 1;
  
  -- If template doesn't exist, create it
  IF template_id IS NULL THEN
    INSERT INTO consent_form_templates (
      title, 
      description, 
      requires_medical_history,
      is_active
    ) VALUES (
      'Standard Piercing Consent Form',
      'Standard medical history and consent form for piercing procedures',
      true,
      true
    ) RETURNING id INTO template_id;
    
    -- Create sections and fields (similar to tattoo template but with piercing-specific wording)
    
    -- Section 1: Your Details (same as tattoo)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Your Details',
      'Please provide your personal information',
      0,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 1
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'clientName', 'text', 'Name', 'Name (required)', true, 0),
    (section_id, 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    (section_id, 'Phone', 'text', 'Phone', 'Phone (required)', true, 2),
    (section_id, 'clientEmail', 'text', 'Email', 'Email (required)', true, 3),
    (section_id, 'FullAddress', 'textarea', 'Address', 'Full Address', true, 4);
    
    -- Section 2: Your Piercer (similar to Your Artist)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Your Piercer',
      'Select the piercer for your procedure',
      1,
      true
    ) RETURNING id INTO section_id;
    
    -- No fields needed for piercer section as it's handled by the application
    
    -- Section 3: Age & Consent (modified for piercing)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Age & Consent',
      'Please confirm the following',
      2,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 3
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', NULL, true, 0),
    (section_id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with piercing, known and unknown, can lead to injury, including but not limited to infection, scarring, and allergic reactions to jewelry materials, latex gloves, and/or cleaning products. Being aware of the potential risks, I still wish to proceed with the piercing and I freely accept and expressly assume any and all risks.', NULL, true, 1),
    (section_id, 'liabilityConfirm', 'checkbox', 'I understand neither the Piercer, Venue nor Event Organiser is responsible for any complications that may arise during or after the piercing procedure. I understand that proper aftercare is essential for healing and preventing infection. I acknowledge that a piercing is a modification to my appearance that may leave permanent marks even if the jewelry is removed.', NULL, true, 2),
    (section_id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the piercing and give consent in advance to their reproduction in print or electronic form.', NULL, true, 3),
    (section_id, 'idPhoto', 'image', 'Upload photo ID (optional)', NULL, false, 4);
    
    -- Set options for radio buttons
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY['Yes', 'No']
    WHERE section_id = section_id AND field_name = 'mediaRelease';
    
    -- Section 4: Medical History (same as tattoo)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'Medical History',
      'Please provide your medical information',
      3,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 4
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'noIssues', 'checkbox', 'No previous piercing issues or relevant medical issues', NULL, false, 0),
    (section_id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, false, 1),
    (section_id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2);
    
    -- Set options for medical issues checkbox
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY[
      'Diabetes',
      'Epilepsy',
      'Haemophilia',
      'Pregnant or breast feeding',
      'Taking blood thinning medication',
      'Skin condition',
      'Heart condition',
      'Recipient of an organ or bone marrow transplant',
      'Any blood-borne pathogens',
      'Any transmittable diseases',
      'Any allergies',
      'Had any adverse reaction to a previous piercing or products used',
      'Fainted or other issues during a previous piercing',
      'Issues with piercing healing',
      'Other'
    ]
    WHERE section_id = section_id AND field_name = 'medicalIssues';
    
    -- Section 5: On The Day (modified for piercing)
    INSERT INTO consent_form_template_sections (
      template_id,
      title,
      description,
      display_order,
      is_required
    ) VALUES (
      template_id,
      'On The Day',
      'Please confirm the following for the day of your procedure',
      4,
      true
    ) RETURNING id INTO section_id;
    
    -- Fields for Section 5
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (section_id, 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the piercer for any healing issues. I understand that should I have any concerns they will be relayed to the piercer immediately for further advice.', NULL, true, 0),
    (section_id, 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', NULL, true, 1),
    (section_id, 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my piercer and my appointment may be cancelled.', NULL, true, 2),
    (section_id, 'noAlcohol', 'checkbox', 'I will not get pierced under the influence of alcohol or drugs.', NULL, true, 3),
    (section_id, 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', NULL, true, 4);
    
    -- Set options for marketing consent radio buttons
    UPDATE consent_form_template_fields 
    SET field_options = ARRAY['Yes', 'No']
    WHERE section_id = section_id AND field_name = 'marketingConsent';
    
    RAISE NOTICE 'Created default piercing consent form template';
  ELSE
    RAISE NOTICE 'Default piercing consent form template already exists';
  END IF;
END $$;

-- Create default aftercare email templates
DO $$
BEGIN
  -- Tattoo aftercare template
  IF NOT EXISTS (SELECT 1 FROM aftercare_templates WHERE procedure_type = 'tattoo' AND title = 'Standard Tattoo Aftercare') THEN
    INSERT INTO aftercare_templates (
      title,
      description,
      procedure_type,
      html_content,
      is_active
    ) VALUES (
      'Standard Tattoo Aftercare',
      'Default aftercare instructions for tattoo procedures',
      'tattoo',
      '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tattoo Aftercare Guide</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6b21a8;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    h1 {
      color: #333;
      margin-top: 0;
      text-align: center;
    }
    h2 {
      color: #333;
      font-size: 1.2em;
      margin-top: 20px;
    }
    .content {
      padding: 20px;
    }
    .artist-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white;">TattSync</h1>
    </div>
    
    <div class="content">
      <h1>Your Tattoo Aftercare Guide</h1>
      <p>Thank you for your trust in getting tattooed by <strong>{{artistName}}</strong> at our event. Here''s everything you need to know to keep your tattoo healing beautifully:</p>
      
      <h2>1. How Long To Leave Wrapped?</h2>
      <p>There are numerous different coverings in use in the tattoo industry. Your artist will give you specific instructions.</p>
      
      <h2>2. Cleaning Your Tattoo</h2>
      <p>Clean your tattoo every day with a clean hand, warm water, and a fragrance-free soap. Let it air dry or gently pat it dry with a clean towel. Showers are great but no sitting water.</p>
      
      <h2>3. Aftercare Products</h2>
      <p>Apply a thin layer of recommended aftercare cream using a clean hand 3-4 times a day.</p>
      
      <h2>4. When To Cover Tattoo</h2>
      <p>Cover your new tattoo when in a dirty environment to help avoid infection. Allow skin to breathe as much as possible.</p>
      
      <h2>5. Clean Clothes And Bedding</h2>
      <p>Always use a clean towel whilst your tattoo is healing and allow it to air dry when possible. Keep clothes and bedding clean and fresh!</p>
      
      <h2>6. Avoid Standing Water</h2>
      <p>Avoid soaking your tattoo for at least a week i.e. baths, swimming, dishwater. Running water such as showers are perfect.</p>
      
      <h2>7. Avoid UV Rays</h2>
      <p>Avoid direct sunlight & sun beds for at least 2 weeks. Always use a strong sunblock to keep your tattoo at its best.</p>
      
      <h2>8. Do Not Pick Or Scratch</h2>
      <p>Please do not pick or scratch your tattoo whilst it is healing. This can cause trauma to the skin and lead to scarring and infection.</p>
      
      <h2>9. Concerns or questions?</h2>
      <p>The artist that applied your tattoo is responsible for any touch-ups, concerns, or ongoing advice.</p>
      
      <div class="artist-info">
        <p>Your artist for this tattoo was <strong>{{artistName}}</strong><br>
        Contact: {{artistEmail}}</p>
      </div>
      
      <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your artist.</p>
      
      <p style="font-weight: bold; margin-top: 20px;">Happy healing!</p>
    </div>
    
    <div class="footer">
      <p>&copy; {{currentYear}} TattSync. All rights reserved.</p>
      <p>This email was sent to {{clientEmail}} regarding your recent tattoo procedure.</p>
    </div>
  </div>
</body>
</html>',
      true
    );
    RAISE NOTICE 'Created default tattoo aftercare template';
  ELSE
    RAISE NOTICE 'Default tattoo aftercare template already exists';
  END IF;
  
  -- Piercing aftercare template
  IF NOT EXISTS (SELECT 1 FROM aftercare_templates WHERE procedure_type = 'piercing' AND title = 'Standard Piercing Aftercare') THEN
    INSERT INTO aftercare_templates (
      title,
      description,
      procedure_type,
      html_content,
      is_active
    ) VALUES (
      'Standard Piercing Aftercare',
      'Default aftercare instructions for piercing procedures',
      'piercing',
      '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Piercing Aftercare Guide</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6b21a8;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    h1 {
      color: #333;
      margin-top: 0;
      text-align: center;
    }
    h2 {
      color: #333;
      font-size: 1.2em;
      margin-top: 20px;
    }
    .content {
      padding: 20px;
    }
    .artist-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white;">TattSync</h1>
    </div>
    
    <div class="content">
      <h1>Your Piercing Aftercare Guide</h1>
      <p>Thank you for your trust in getting pierced by <strong>{{artistName}}</strong> at our event. Here''s everything you need to know to keep your piercing healing properly:</p>
      
      <h2>1. Cleaning Your Piercing</h2>
      <p>Clean your piercing twice daily with a sterile saline solution. Avoid using alcohol, hydrogen peroxide, or harsh soaps.</p>
      
      <h2>2. Handling Your Piercing</h2>
      <p>Always wash your hands thoroughly before touching your piercing. Avoid rotating, twisting, or playing with your jewelry.</p>
      
      <h2>3. Avoid Contamination</h2>
      <p>Keep makeup, lotions, and hair products away from your piercing. Change pillowcases and towels regularly.</p>
      
      <h2>4. Swimming and Bathing</h2>
      <p>Avoid swimming pools, hot tubs, lakes, and oceans during the healing period. Shower instead of taking baths.</p>
      
      <h2>5. Healing Time</h2>
      <p>Remember that healing times vary depending on the piercing location. Be patient and continue aftercare for the full healing period.</p>
      
      <h2>6. Signs of Infection</h2>
      <p>Watch for increased redness, swelling, pain, warmth, or discharge. If you suspect an infection, contact a healthcare professional.</p>
      
      <h2>7. Jewelry</h2>
      <p>Do not change your jewelry until the piercing is fully healed. When you do change it, ensure you use high-quality materials.</p>
      
      <h2>8. Concerns or questions?</h2>
      <p>The piercer that performed your procedure is responsible for any concerns or ongoing advice.</p>
      
      <div class="artist-info">
        <p>Your piercer for this procedure was <strong>{{artistName}}</strong><br>
        Contact: {{artistEmail}}</p>
      </div>
      
      <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your piercer.</p>
      
      <p style="font-weight: bold; margin-top: 20px;">Happy healing!</p>
    </div>
    
    <div class="footer">
      <p>&copy; {{currentYear}} TattSync. All rights reserved.</p>
      <p>This email was sent to {{clientEmail}} regarding your recent piercing procedure.</p>
    </div>
  </div>
</body>
</html>',
      true
    );
    RAISE NOTICE 'Created default piercing aftercare template';
  ELSE
    RAISE NOTICE 'Default piercing aftercare template already exists';
  END IF;
END $$;