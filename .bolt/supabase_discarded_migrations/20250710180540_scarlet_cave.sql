/*
  # Consent Form Structure

  1. New Tables
    - `consent_form_templates` - Master templates for consent forms
      - `id` (serial, primary key)
      - `title` (text)
      - `description` (text)
      - `form_structure` (jsonb) - Stores the complete form structure
      - `requires_medical_history` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `consent_form_template_sections` - Sections within templates
      - `id` (serial, primary key)
      - `template_id` (references consent_form_templates)
      - `title` (text)
      - `description` (text)
      - `display_order` (integer)
      - `is_required` (boolean)
    - `consent_form_template_fields` - Fields within sections
      - `id` (serial, primary key)
      - `section_id` (references consent_form_template_sections)
      - `field_name` (text)
      - `field_type` (text)
      - `field_label` (text)
      - `field_placeholder` (text)
      - `field_options` (jsonb)
      - `is_required` (boolean)
      - `display_order` (integer)
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create consent form templates table
CREATE TABLE IF NOT EXISTS consent_form_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  form_structure JSONB DEFAULT '{}'::jsonb,
  requires_medical_history BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent form template sections table
CREATE TABLE IF NOT EXISTS consent_form_template_sections (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES consent_form_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent form template fields table
CREATE TABLE IF NOT EXISTS consent_form_template_fields (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES consent_form_template_sections(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'checkbox', 'radio', 'select', 'date', 'file', 'image')),
  field_label TEXT NOT NULL,
  field_placeholder TEXT,
  field_options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_fields ENABLE ROW LEVEL SECURITY;

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

-- Insert default tattoo consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES ('Tattoo Consent Form', 'Medical history and consent form for tattoo procedures', true, true);

-- Get the ID of the inserted template
DO $$
DECLARE
  template_id INTEGER;
BEGIN
  SELECT id INTO template_id FROM consent_form_templates WHERE title = 'Tattoo Consent Form' LIMIT 1;

  -- Insert sections for the tattoo consent form
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES 
    (template_id, 'Your Details', 'Please provide your personal information', 0, true),
    (template_id, 'Your Artist', 'Select the artist for your procedure', 1, true),
    (template_id, 'Age & Consent', 'Please confirm the following', 2, true),
    (template_id, 'Medical History', 'Please provide your medical information', 3, true),
    (template_id, 'On The Day', 'Please confirm the following for the day of your procedure', 4, true);

  -- Insert fields for "Your Details" section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'clientName', 'text', 'Name', 'Your full name', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'DOB', 'date', 'Date of Birth', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'Phone', 'text', 'Phone', 'Your contact number', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'clientEmail', 'text', 'Email', 'Your email address', true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'FullAddress', 'textarea', 'Address', 'Your full address', true, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  -- Insert fields for "Age & Consent" section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with tattooing, known and unknown, can lead to injury, including but not limited to infection, scarring, difficulties in detecting melanoma and allergic reactions to tattoo pigment, latex gloves, and/or soap. Being aware of the potential risks, I still wish to proceed with the tattoo application and I freely accept and expressly assume any and all risks.', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'liabilityConfirm', 'checkbox', 'I understand neither the Artist, Venue nor Event Organiser is responsible for the meaning or spelling of the symbol or text that I have provided to them or chosen from the flash (design) sheets. Variations in colour/design may exist between the art I have selected and the actual tattoo. I also understand that over time, the colours and the clarity of my tattoo will fade due to natural dispersion of pigment under the skin. A tattoo is a permanent change to my appearance and can only be removed by laser or surgical means, which can be disfiguring and/or costly and which in all likelihood will not result in the restoration of my skin.', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the tattoo and give consent in advance to their reproduction in print or electronic form.', '["Yes", "No"]'::jsonb, true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'idPhoto', 'image', 'Upload photo ID (optional)', false, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  -- Insert fields for "Medical History" section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'noIssues', 'checkbox', 'No previous tattoo issues or relevant medical issues', false, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous tattoo or products used", "Fainted or other issues during a previous tattoo", "Issues with tattoo healing", "Other"]'::jsonb, false, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  -- Insert fields for "On The Day" section
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the artist for any healing issues. I understand that should I have any concerns they will be relayed to the artist immediately for further advice.', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my artist and my appointment may be cancelled.', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'noAlcohol', 'checkbox', 'I will not get tattooed under the influence of alcohol or drugs.', true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', '["Yes", "No"]'::jsonb, true, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';
END $$;

-- Insert default piercing consent form template
INSERT INTO consent_form_templates (title, description, requires_medical_history, is_active)
VALUES ('Piercing Consent Form', 'Medical history and consent form for piercing procedures', true, true);

-- Get the ID of the inserted template
DO $$
DECLARE
  template_id INTEGER;
BEGIN
  SELECT id INTO template_id FROM consent_form_templates WHERE title = 'Piercing Consent Form' LIMIT 1;

  -- Insert sections for the piercing consent form (similar structure to tattoo form)
  INSERT INTO consent_form_template_sections (template_id, title, description, display_order, is_required)
  VALUES 
    (template_id, 'Your Details', 'Please provide your personal information', 0, true),
    (template_id, 'Your Piercer', 'Select the piercer for your procedure', 1, true),
    (template_id, 'Age & Consent', 'Please confirm the following', 2, true),
    (template_id, 'Medical History', 'Please provide your medical information', 3, true),
    (template_id, 'On The Day', 'Please confirm the following for the day of your procedure', 4, true);

  -- Insert fields for "Your Details" section (same as tattoo form)
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'clientName', 'text', 'Name', 'Your full name', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'DOB', 'date', 'Date of Birth', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'Phone', 'text', 'Phone', 'Your contact number', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'clientEmail', 'text', 'Email', 'Your email address', true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'FullAddress', 'textarea', 'Address', 'Your full address', true, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Your Details';

  -- Insert fields for "Age & Consent" section (modified for piercing)
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'ageConfirm', 'checkbox', 'I confirm that I am aged 18 or over and may be asked to produce valid identification (UK Driving Licence or Passport) proving this at my appointment and failure to provide the I.D will result in refusal of service and a charge.', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'riskConfirm', 'checkbox', 'I fully understand that there are risks with piercing, known and unknown, can lead to injury, including but not limited to infection, scarring, and allergic reactions to jewelry materials, latex gloves, and/or cleaning products. Being aware of the potential risks, I still wish to proceed with the piercing and I freely accept and expressly assume any and all risks.', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'liabilityConfirm', 'checkbox', 'I understand neither the Piercer, Venue nor Event Organiser is responsible for any complications that may arise from my piercing. I understand that piercings may migrate or reject based on my body''s individual healing process, and this is not the fault of the piercer. I also understand that proper aftercare is essential for healing and preventing complications.', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'mediaRelease', 'radio', 'I release all rights to any photographs and video taken of me and the piercing and give consent in advance to their reproduction in print or electronic form.', '["Yes", "No"]'::jsonb, true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'idPhoto', 'image', 'Upload photo ID (optional)', false, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Age & Consent';

  -- Insert fields for "Medical History" section (same as tattoo form)
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'noIssues', 'checkbox', 'No previous piercing issues or relevant medical issues', false, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'medicalIssues', 'checkbox', 'Medical conditions (select all that apply)', '["Diabetes", "Epilepsy", "Haemophilia", "Pregnant or breast feeding", "Taking blood thinning medication", "Skin condition", "Heart condition", "Recipient of an organ or bone marrow transplant", "Any blood-borne pathogens", "Any transmittable diseases", "Any allergies", "Had any adverse reaction to a previous piercing or products used", "Fainted or other issues during a previous piercing", "Issues with piercing healing", "Other"]'::jsonb, false, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_placeholder, is_required, display_order
  )
  SELECT 
    id, 'medicalDetails', 'textarea', 'Medical Details', 'Please provide details of any medical conditions selected above', false, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'Medical History';

  -- Insert fields for "On The Day" section (modified for piercing)
  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'aftercareAdvice', 'checkbox', 'I understand that I will be given aftercare advice in verbal form and by email. This is advice based on the opinion of best practice and whilst it is recommended that I follow it I waive any liability of the venue, event organiser and the piercer for any healing issues. I understand that should I have any concerns they will be relayed to the piercer immediately for further advice.', true, 0
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'eatBefore', 'checkbox', 'l confirm that I have eaten within the 2 hours of the appointment to increase my blood sugar levels.', true, 1
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'unwell', 'checkbox', 'I understand that if I am unwell or unfit at the time of my appointment that I will inform my piercer and my appointment may be cancelled.', true, 2
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, is_required, display_order
  )
  SELECT 
    id, 'noAlcohol', 'checkbox', 'I will not get pierced under the influence of alcohol or drugs.', true, 3
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';

  INSERT INTO consent_form_template_fields (
    section_id, field_name, field_type, field_label, field_options, is_required, display_order
  )
  SELECT 
    id, 'marketingConsent', 'radio', 'I agree for my name and email address to be used by the Event Organiser to inform me of other similar events and partner offers.', '["Yes", "No"]'::jsonb, true, 4
  FROM consent_form_template_sections 
  WHERE template_id = template_id AND title = 'On The Day';
END $$;