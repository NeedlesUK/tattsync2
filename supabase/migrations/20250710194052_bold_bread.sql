/*
  # Consent Form Templates

  1. New Tables
    - `consent_form_templates` - Master templates for consent forms
    - `consent_form_template_sections` - Sections within templates
    - `consent_form_template_fields` - Fields within sections
    - `aftercare_templates` - Templates for aftercare instructions

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create consent form templates table
CREATE TABLE IF NOT EXISTS consent_form_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requires_medical_history BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent form template sections table
CREATE TABLE IF NOT EXISTS consent_form_template_sections (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES consent_form_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent form template fields table
CREATE TABLE IF NOT EXISTS consent_form_template_fields (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES consent_form_template_sections(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'checkbox', 'radio', 'select', 'date', 'file', 'image')),
  field_label TEXT NOT NULL,
  field_placeholder TEXT,
  field_options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create aftercare templates table
CREATE TABLE IF NOT EXISTS aftercare_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  procedure_type TEXT NOT NULL CHECK (procedure_type IN ('tattoo', 'piercing', 'other')),
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage consent form templates" 
  ON consent_form_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can manage consent form template sections" 
  ON consent_form_template_sections
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can manage consent form template fields" 
  ON consent_form_template_fields
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can manage aftercare templates" 
  ON aftercare_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Insert default tattoo aftercare template
INSERT INTO aftercare_templates (
  title, 
  description, 
  procedure_type, 
  html_content
) VALUES (
  'Standard Tattoo Aftercare',
  'Default aftercare instructions for tattoos',
  'tattoo',
  '<div style="padding: 20px;">
    <h1 style="color: #333; margin-top: 0; text-align: center;">Your Tattoo Aftercare Guide</h1>
    <p>Thank you for your trust in getting tattooed by <strong>{{artistName}}</strong> at our event. Here''s everything you need to know to keep your tattoo healing beautifully:</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">1. How Long To Leave Wrapped?</h2>
    <p>There are numerous different coverings in use in the tattoo industry. Your artist will give you specific instructions.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">2. Cleaning Your Tattoo</h2>
    <p>Clean your tattoo every day with a clean hand, warm water, and a fragrance-free soap. Let it air dry or gently pat it dry with a clean towel. Showers are great but no sitting water.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">3. Aftercare Products</h2>
    <p>Apply a thin layer of recommended aftercare cream using a clean hand 3-4 times a day.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">4. When To Cover Tattoo</h2>
    <p>Cover your new tattoo when in a dirty environment to help avoid infection. Allow skin to breathe as much as possible.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">5. Clean Clothes And Bedding</h2>
    <p>Always use a clean towel whilst your tattoo is healing and allow it to air dry when possible. Keep clothes and bedding clean and fresh!</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">6. Avoid Standing Water</h2>
    <p>Avoid soaking your tattoo for at least a week i.e. baths, swimming, dishwater. Running water such as showers are perfect.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">7. Avoid UV Rays</h2>
    <p>Avoid direct sunlight & sun beds for at least 2 weeks. Always use a strong sunblock to keep your tattoo at its best.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">8. Do Not Pick Or Scratch</h2>
    <p>Please do not pick or scratch your tattoo whilst it is healing. This can cause trauma to the skin and lead to scarring and infection.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">9. Concerns or questions?</h2>
    <p>The artist that applied your tattoo is responsible for any touch-ups, concerns, or ongoing advice.</p>
    <p>Your artist for this tattoo was <strong>{{artistName}}</strong><br>
    Contact: {{artistEmail}}</p>
    <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your artist.</p>
    <p style="font-weight: bold; margin-top: 20px;">Happy healing!</p>
  </div>'
);

-- Insert default piercing aftercare template
INSERT INTO aftercare_templates (
  title, 
  description, 
  procedure_type, 
  html_content
) VALUES (
  'Standard Piercing Aftercare',
  'Default aftercare instructions for piercings',
  'piercing',
  '<div style="padding: 20px;">
    <h1 style="color: #333; margin-top: 0; text-align: center;">Your Piercing Aftercare Guide</h1>
    <p>Thank you for your trust in getting pierced by <strong>{{artistName}}</strong> at our event. Here''s everything you need to know to keep your piercing healing properly:</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">1. Cleaning Your Piercing</h2>
    <p>Clean your piercing twice daily with a sterile saline solution. Avoid using alcohol, hydrogen peroxide, or harsh soaps.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">2. Handling Your Piercing</h2>
    <p>Always wash your hands thoroughly before touching your piercing. Avoid rotating, twisting, or playing with your jewelry.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">3. Avoid Contamination</h2>
    <p>Keep makeup, lotions, and hair products away from your piercing. Change pillowcases and towels regularly.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">4. Swimming and Bathing</h2>
    <p>Avoid swimming pools, hot tubs, lakes, and oceans during the healing period. Shower instead of taking baths.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">5. Healing Time</h2>
    <p>Remember that healing times vary depending on the piercing location. Be patient and continue aftercare for the full healing period.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">6. Signs of Infection</h2>
    <p>Watch for increased redness, swelling, pain, warmth, or discharge. If you suspect an infection, contact a healthcare professional.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">7. Jewelry</h2>
    <p>Do not change your jewelry until the piercing is fully healed. When you do change it, ensure you use high-quality materials.</p>
    <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">8. Concerns or questions?</h2>
    <p>The piercer that performed your procedure is responsible for any concerns or ongoing advice.</p>
    <p>Your piercer for this procedure was <strong>{{artistName}}</strong><br>
    Contact: {{artistEmail}}</p>
    <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your piercer.</p>
    <p style="font-weight: bold; margin-top: 20px;">Happy healing!</p>
  </div>'
);

-- Create a default tattoo consent form template
INSERT INTO consent_form_templates (
  title,
  description,
  requires_medical_history,
  is_active
) VALUES (
  'Standard Tattoo Consent Form',
  'Default consent form for tattoo procedures',
  true,
  true
);

-- Get the ID of the inserted template
DO $$
DECLARE
  template_id INTEGER;
BEGIN
  SELECT id INTO template_id FROM consent_form_templates WHERE title = 'Standard Tattoo Consent Form' LIMIT 1;

  -- Create sections for the template
  INSERT INTO consent_form_template_sections (
    template_id,
    title,
    description,
    display_order,
    is_required
  ) VALUES
  (template_id, 'Personal Information', 'Basic contact information', 0, true),
  (template_id, 'Medical History', 'Health information relevant to tattooing', 1, true),
  (template_id, 'Consent Agreement', 'Terms and conditions for the tattoo procedure', 2, true);

  -- Get section IDs
  DECLARE
    personal_section_id INTEGER;
    medical_section_id INTEGER;
    consent_section_id INTEGER;
  BEGIN
    SELECT id INTO personal_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Personal Information' LIMIT 1;
    
    SELECT id INTO medical_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Medical History' LIMIT 1;
    
    SELECT id INTO consent_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Consent Agreement' LIMIT 1;

    -- Add fields to Personal Information section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (personal_section_id, 'clientName', 'text', 'Full Name', 'Enter your full name', true, 0),
    (personal_section_id, 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    (personal_section_id, 'Phone', 'text', 'Phone Number', 'Enter your phone number', true, 2),
    (personal_section_id, 'clientEmail', 'text', 'Email Address', 'Enter your email address', true, 3),
    (personal_section_id, 'FullAddress', 'textarea', 'Full Address', 'Enter your complete address', true, 4);

    -- Add fields to Medical History section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      field_options,
      is_required,
      display_order
    ) VALUES
    (medical_section_id, 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', NULL, NULL, false, 0),
    (medical_section_id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, 
     '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous tattoo or products used", "Fainted or other issues during a previous tattoo", "Issues with tattoo healing", "Other"]', 
     false, 1),
    (medical_section_id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', NULL, false, 2);

    -- Add fields to Consent Agreement section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      is_required,
      display_order
    ) VALUES
    (consent_section_id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', true, 0),
    (consent_section_id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', true, 1),
    (consent_section_id, 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', true, 2),
    (consent_section_id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', true, 3),
    (consent_section_id, 'idPhoto', 'image', 'Upload photo ID (optional)', false, 4);
  END;
END $$;

-- Create a default piercing consent form template
INSERT INTO consent_form_templates (
  title,
  description,
  requires_medical_history,
  is_active
) VALUES (
  'Standard Piercing Consent Form',
  'Default consent form for piercing procedures',
  true,
  true
);

-- Get the ID of the inserted template
DO $$
DECLARE
  template_id INTEGER;
BEGIN
  SELECT id INTO template_id FROM consent_form_templates WHERE title = 'Standard Piercing Consent Form' LIMIT 1;

  -- Create sections for the template
  INSERT INTO consent_form_template_sections (
    template_id,
    title,
    description,
    display_order,
    is_required
  ) VALUES
  (template_id, 'Personal Information', 'Basic contact information', 0, true),
  (template_id, 'Medical History', 'Health information relevant to piercing', 1, true),
  (template_id, 'Consent Agreement', 'Terms and conditions for the piercing procedure', 2, true);

  -- Get section IDs
  DECLARE
    personal_section_id INTEGER;
    medical_section_id INTEGER;
    consent_section_id INTEGER;
  BEGIN
    SELECT id INTO personal_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Personal Information' LIMIT 1;
    
    SELECT id INTO medical_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Medical History' LIMIT 1;
    
    SELECT id INTO consent_section_id FROM consent_form_template_sections 
    WHERE template_id = template_id AND title = 'Consent Agreement' LIMIT 1;

    -- Add fields to Personal Information section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      is_required,
      display_order
    ) VALUES
    (personal_section_id, 'clientName', 'text', 'Full Name', 'Enter your full name', true, 0),
    (personal_section_id, 'DOB', 'date', 'Date of Birth', NULL, true, 1),
    (personal_section_id, 'Phone', 'text', 'Phone Number', 'Enter your phone number', true, 2),
    (personal_section_id, 'clientEmail', 'text', 'Email Address', 'Enter your email address', true, 3),
    (personal_section_id, 'FullAddress', 'textarea', 'Full Address', 'Enter your complete address', true, 4);

    -- Add fields to Medical History section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      field_placeholder,
      field_options,
      is_required,
      display_order
    ) VALUES
    (medical_section_id, 'noIssues', 'checkbox', 'No previous piercing issues or relevant medical issues', NULL, NULL, false, 0),
    (medical_section_id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', NULL, 
     '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous piercing or products used", "Fainted or other issues during a previous piercing", "Issues with piercing healing", "Other"]', 
     false, 1),
    (medical_section_id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', NULL, false, 2);

    -- Add fields to Consent Agreement section
    INSERT INTO consent_form_template_fields (
      section_id,
      field_name,
      field_type,
      field_label,
      is_required,
      display_order
    ) VALUES
    (consent_section_id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', true, 0),
    (consent_section_id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with piercing, known and unknown, can lead to injury, including but not limited to infection, scarring, and allergic reactions to jewelry, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the piercing and I freely accept and expressly assume any and all risks.', true, 1),
    (consent_section_id, 'aftercareConfirm', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the piercer for any healing issues. I understand that should I have any concerns they will be relayed to the piercer immediately for further advice.', true, 2),
    (consent_section_id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the piercing and give consent in advance to their reproduction in print or electronic form.', true, 3),
    (consent_section_id, 'idPhoto', 'image', 'Upload photo ID (optional)', false, 4);
  END;
END $$;

-- Create a function to generate a new consent QR code
CREATE OR REPLACE FUNCTION generate_consent_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a random code
  NEW.code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to create a consent notification
CREATE OR REPLACE FUNCTION create_consent_notification()
RETURNS TRIGGER AS $$
DECLARE
  artist_id UUID;
BEGIN
  -- Find the artist associated with this form submission
  SELECT a.user_id INTO artist_id
  FROM artist_client_consents acc
  JOIN applications a ON acc.artist_id = a.user_id
  WHERE acc.submission_id = NEW.id
  LIMIT 1;
  
  -- Create a notification for the artist
  IF artist_id IS NOT NULL THEN
    INSERT INTO consent_notifications (
      submission_id,
      recipient_id,
      is_read,
      created_at
    ) VALUES (
      NEW.id,
      artist_id,
      false,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to execute SQL
CREATE OR REPLACE FUNCTION execute_sql(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- Create a function to create the aftercare_templates table if it doesn't exist
CREATE OR REPLACE FUNCTION create_aftercare_templates_table() RETURNS void AS $$
BEGIN
  PERFORM execute_sql('
    CREATE TABLE IF NOT EXISTS aftercare_templates (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      procedure_type TEXT NOT NULL CHECK (procedure_type IN (''tattoo'', ''piercing'', ''other'')),
      html_content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    ALTER TABLE aftercare_templates ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can manage aftercare templates" 
      ON aftercare_templates
      FOR ALL
      TO authenticated
      USING (auth.uid() IN (SELECT id FROM users WHERE role = ''admin''));
  ');
END;
$$ LANGUAGE plpgsql;