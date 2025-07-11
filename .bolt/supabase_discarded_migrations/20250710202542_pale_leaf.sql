/*
  # Add Default Templates

  1. New Data
    - Default tattoo consent form template
    - Default piercing consent form template
    - Default tattoo aftercare template
    - Default piercing aftercare template
*/

-- Insert default tattoo consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES (
  'Standard Tattoo Consent Form',
  'Default consent form for tattoo procedures',
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Get the ID of the inserted template
DO $$
DECLARE
  template_id INTEGER;
BEGIN
  SELECT id INTO template_id FROM consent_form_templates 
  WHERE title = 'Standard Tattoo Consent Form' 
  LIMIT 1;

  IF template_id IS NOT NULL THEN
    -- Insert sections for the template
    
    -- Personal Details Section
    INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
    VALUES (
      template_id,
      'Your Details',
      'Please provide your personal information',
      0,
      true
    )
    ON CONFLICT DO NOTHING;
    
    -- Get the ID of the inserted section
    DECLARE
      section_id INTEGER;
    BEGIN
      SELECT id INTO section_id FROM consent_form_template_sections 
      WHERE template_id = template_id AND title = 'Your Details' 
      LIMIT 1;
      
      IF section_id IS NOT NULL THEN
        -- Insert fields for the section
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
        )
        VALUES
          (section_id, 'clientName', 'text', 'Name', 'Your full name', true, 0),
          (section_id, 'DOB', 'date', 'Date of Birth', NULL, true, 1),
          (section_id, 'Phone', 'text', 'Phone', 'Your contact number', true, 2),
          (section_id, 'clientEmail', 'text', 'Email', 'Your email address', true, 3),
          (section_id, 'FullAddress', 'textarea', 'Address', 'Your full address', true, 4)
        ON CONFLICT DO NOTHING;
      END IF;
    END;
    
    -- Age & Consent Section
    INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
    VALUES (
      template_id,
      'Age & Consent',
      'Please confirm the following',
      1,
      true
    )
    ON CONFLICT DO NOTHING;
    
    -- Get the ID of the inserted section
    DECLARE
      section_id INTEGER;
    BEGIN
      SELECT id INTO section_id FROM consent_form_template_sections 
      WHERE template_id = template_id AND title = 'Age & Consent' 
      LIMIT 1;
      
      IF section_id IS NOT NULL THEN
        -- Insert fields for the section
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, is_required, display_order
        )
        VALUES
          (section_id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', true, 0),
          (section_id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', true, 1),
          (section_id, 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', true, 2)
        ON CONFLICT DO NOTHING;
        
        -- Insert radio button field with options
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, field_options, is_required, display_order
        )
        VALUES
          (section_id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', '["Yes", "No"]', true, 3)
        ON CONFLICT DO NOTHING;
        
        -- Insert image upload field
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, is_required, display_order
        )
        VALUES
          (section_id, 'idPhoto', 'image', 'Upload photo ID (optional)', false, 4)
        ON CONFLICT DO NOTHING;
      END IF;
    END;
    
    -- Medical History Section
    INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
    VALUES (
      template_id,
      'Medical History',
      'Please provide your medical information',
      2,
      true
    )
    ON CONFLICT DO NOTHING;
    
    -- Get the ID of the inserted section
    DECLARE
      section_id INTEGER;
    BEGIN
      SELECT id INTO section_id FROM consent_form_template_sections 
      WHERE template_id = template_id AND title = 'Medical History' 
      LIMIT 1;
      
      IF section_id IS NOT NULL THEN
        -- Insert fields for the section
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, is_required, display_order
        )
        VALUES
          (section_id, 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', false, 0)
        ON CONFLICT DO NOTHING;
        
        -- Insert checkbox field with options
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, field_options, is_required, display_order
        )
        VALUES
          (section_id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous tattoo or products used", "Fainted or other issues during a previous tattoo", "Issues with tattoo healing", "Other"]', false, 1)
        ON CONFLICT DO NOTHING;
        
        -- Insert textarea field
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
        )
        VALUES
          (section_id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2)
        ON CONFLICT DO NOTHING;
      END IF;
    END;
    
    -- On The Day Section
    INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
    VALUES (
      template_id,
      'On The Day',
      'Please confirm the following for the day of your procedure',
      3,
      true
    )
    ON CONFLICT DO NOTHING;
    
    -- Get the ID of the inserted section
    DECLARE
      section_id INTEGER;
    BEGIN
      SELECT id INTO section_id FROM consent_form_template_sections 
      WHERE template_id = template_id AND title = 'On The Day' 
      LIMIT 1;
      
      IF section_id IS NOT NULL THEN
        -- Insert fields for the section
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, is_required, display_order
        )
        VALUES
          (section_id, 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.', true, 0),
          (section_id, 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', true, 1),
          (section_id, 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.', true, 2),
          (section_id, 'noAlcohol', 'checkbox', 'I will not get tattooed under the influence of alcohol or drugs.', true, 3)
        ON CONFLICT DO NOTHING;
        
        -- Insert radio button field with options
        INSERT INTO consent_form_template_fields (
          section_id, field_name, field_type, field_label, field_options, is_required, display_order
        )
        VALUES
          (section_id, 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', '["Yes", "No"]', true, 4)
        ON CONFLICT DO NOTHING;
      END IF;
    END;
  END IF;
END $$;

-- Insert default piercing consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES (
  'Standard Piercing Consent Form',
  'Default consent form for piercing procedures',
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Insert default tattoo aftercare template
INSERT INTO aftercare_templates (title, description, procedure_type, html_content, is_active)
VALUES (
  'Standard Tattoo Aftercare',
  'Default aftercare instructions for tattoos',
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
)
ON CONFLICT DO NOTHING;

-- Insert default piercing aftercare template
INSERT INTO aftercare_templates (title, description, procedure_type, html_content, is_active)
VALUES (
  'Standard Piercing Aftercare',
  'Default aftercare instructions for piercings',
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
)
ON CONFLICT DO NOTHING;