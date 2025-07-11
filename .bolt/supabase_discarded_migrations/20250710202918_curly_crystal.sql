/*
  # Add default templates

  1. New Data
    - Default tattoo consent form template
    - Default piercing consent form template
    - Default tattoo aftercare template
    - Default piercing aftercare template
*/

-- Add default tattoo consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES (
  'Standard Tattoo Consent Form',
  'Default consent form for tattoo procedures',
  TRUE,
  TRUE
)
ON CONFLICT DO NOTHING;

-- Get the ID of the tattoo template
DO $$
DECLARE
  tattoo_template_id INTEGER;
BEGIN
  SELECT id INTO tattoo_template_id FROM consent_form_templates 
  WHERE title = 'Standard Tattoo Consent Form' 
  LIMIT 1;

  -- Add sections for tattoo template
  -- Personal Details Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    tattoo_template_id,
    'Your Details',
    'Please provide your personal information',
    0,
    TRUE
  );

  -- Get the ID of the personal details section
  WITH personal_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = tattoo_template_id AND title = 'Your Details'
    LIMIT 1
  )
  -- Add fields for personal details section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  VALUES
    ((SELECT id FROM personal_section), 'clientName', 'text', 'Name', 'Your full name', TRUE, 0),
    ((SELECT id FROM personal_section), 'DOB', 'date', 'Date of Birth', NULL, TRUE, 1),
    ((SELECT id FROM personal_section), 'Phone', 'text', 'Phone', 'Your contact number', TRUE, 2),
    ((SELECT id FROM personal_section), 'clientEmail', 'text', 'Email', 'Your email address', TRUE, 3),
    ((SELECT id FROM personal_section), 'FullAddress', 'textarea', 'Address', 'Your full address', TRUE, 4);

  -- Age & Consent Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    tattoo_template_id,
    'Age & Consent',
    'Please confirm the following',
    1,
    TRUE
  );

  -- Get the ID of the age & consent section
  WITH consent_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = tattoo_template_id AND title = 'Age & Consent'
    LIMIT 1
  )
  -- Add fields for age & consent section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', TRUE, 0),
    ((SELECT id FROM consent_section), 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', TRUE, 1),
    ((SELECT id FROM consent_section), 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', TRUE, 2);

  -- Add media release field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', '["Yes", "No"]', TRUE, 3);

  -- Add ID photo field
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'idPhoto', 'image', 'Upload photo ID (optional)', FALSE, 4);

  -- Medical History Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    tattoo_template_id,
    'Medical History',
    'Please provide your medical information',
    2,
    TRUE
  );

  -- Get the ID of the medical history section
  WITH medical_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = tattoo_template_id AND title = 'Medical History'
    LIMIT 1
  )
  -- Add fields for medical history section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', FALSE, 0);

  -- Add medical issues field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous tattoo or products used", "Fainted or other issues during a previous tattoo", "Issues with tattoo healing", "Other"]', FALSE, 1);

  -- Add medical details field
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', FALSE, 2);

  -- On The Day Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    tattoo_template_id,
    'On The Day',
    'Please confirm the following for the day of your procedure',
    3,
    TRUE
  );

  -- Get the ID of the on the day section
  WITH onday_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = tattoo_template_id AND title = 'On The Day'
    LIMIT 1
  )
  -- Add fields for on the day section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM onday_section), 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.', TRUE, 0),
    ((SELECT id FROM onday_section), 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', TRUE, 1),
    ((SELECT id FROM onday_section), 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.', TRUE, 2),
    ((SELECT id FROM onday_section), 'noAlcohol', 'checkbox', 'I will not get tattooed under the influence of alcohol or drugs.', TRUE, 3);

  -- Add marketing consent field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM onday_section), 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', '["Yes", "No"]', TRUE, 4);
END $$;

-- Add default piercing consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES (
  'Standard Piercing Consent Form',
  'Default consent form for piercing procedures',
  TRUE,
  TRUE
)
ON CONFLICT DO NOTHING;

-- Get the ID of the piercing template
DO $$
DECLARE
  piercing_template_id INTEGER;
BEGIN
  SELECT id INTO piercing_template_id FROM consent_form_templates 
  WHERE title = 'Standard Piercing Consent Form' 
  LIMIT 1;

  -- Add sections for piercing template
  -- Personal Details Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    piercing_template_id,
    'Your Details',
    'Please provide your personal information',
    0,
    TRUE
  );

  -- Get the ID of the personal details section
  WITH personal_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = piercing_template_id AND title = 'Your Details'
    LIMIT 1
  )
  -- Add fields for personal details section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  VALUES
    ((SELECT id FROM personal_section), 'clientName', 'text', 'Name', 'Your full name', TRUE, 0),
    ((SELECT id FROM personal_section), 'DOB', 'date', 'Date of Birth', NULL, TRUE, 1),
    ((SELECT id FROM personal_section), 'Phone', 'text', 'Phone', 'Your contact number', TRUE, 2),
    ((SELECT id FROM personal_section), 'clientEmail', 'text', 'Email', 'Your email address', TRUE, 3),
    ((SELECT id FROM personal_section), 'FullAddress', 'textarea', 'Address', 'Your full address', TRUE, 4);

  -- Age & Consent Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    piercing_template_id,
    'Age & Consent',
    'Please confirm the following',
    1,
    TRUE
  );

  -- Get the ID of the age & consent section
  WITH consent_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = piercing_template_id AND title = 'Age & Consent'
    LIMIT 1
  )
  -- Add fields for age & consent section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', TRUE, 0),
    ((SELECT id FROM consent_section), 'riskConfirm', 'checkbox', 'I fully understand that there are risks with piercing, known and unknown, can lead to injury, including but not limited to infection, scarring, and allergic reactions to jewelry materials, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the piercing and I freely accept and expressly assume any and all risks.', TRUE, 1),
    ((SELECT id FROM consent_section), 'liabilityConfirm', 'checkbox', 'I understand neither the Piercer, Venue nor Event Organiser is responsible for any complications that may arise during or after the piercing procedure. I understand that proper aftercare is essential for healing and preventing infection.', TRUE, 2);

  -- Add media release field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the piercing and give consent in advance to their reproduction in print or electronic form.', '["Yes", "No"]', TRUE, 3);

  -- Add ID photo field
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM consent_section), 'idPhoto', 'image', 'Upload photo ID (optional)', FALSE, 4);

  -- Medical History Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    piercing_template_id,
    'Medical History',
    'Please provide your medical information',
    2,
    TRUE
  );

  -- Get the ID of the medical history section
  WITH medical_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = piercing_template_id AND title = 'Medical History'
    LIMIT 1
  )
  -- Add fields for medical history section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'noIssues', 'checkbox', 'No previous piercing issues or relevant medical issues', FALSE, 0);

  -- Add medical issues field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to previous piercings or jewelry", "Fainted or other issues during a previous piercing", "Issues with piercing healing", "Other"]', FALSE, 1);

  -- Add medical details field
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  VALUES
    ((SELECT id FROM medical_section), 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', FALSE, 2);

  -- On The Day Section
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES (
    piercing_template_id,
    'On The Day',
    'Please confirm the following for the day of your procedure',
    3,
    TRUE
  );

  -- Get the ID of the on the day section
  WITH onday_section AS (
    SELECT id FROM consent_form_template_sections 
    WHERE template_id = piercing_template_id AND title = 'On The Day'
    LIMIT 1
  )
  -- Add fields for on the day section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  VALUES
    ((SELECT id FROM onday_section), 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the piercer for any healing issues. I understand that should I have any concerns they will be relayed to the piercer immediately for further advice.', TRUE, 0),
    ((SELECT id FROM onday_section), 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', TRUE, 1),
    ((SELECT id FROM onday_section), 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my piercer and my appointment may be cancelled.', TRUE, 2),
    ((SELECT id FROM onday_section), 'noAlcohol', 'checkbox', 'I will not get pierced under the influence of alcohol or drugs.', TRUE, 3);

  -- Add marketing consent field with options
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  VALUES
    ((SELECT id FROM onday_section), 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', '["Yes", "No"]', TRUE, 4);
END $$;

-- Add default tattoo aftercare template
INSERT INTO aftercare_templates (title, description, procedure_type, html_content, is_active)
VALUES (
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
  TRUE
)
ON CONFLICT DO NOTHING;

-- Add default piercing aftercare template
INSERT INTO aftercare_templates (title, description, procedure_type, html_content, is_active)
VALUES (
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
  TRUE
)
ON CONFLICT DO NOTHING;