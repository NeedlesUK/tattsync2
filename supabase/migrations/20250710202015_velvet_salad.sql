/*
  # Ensure Template Tables Exist

  1. New Tables
    - `consent_form_templates` - Master templates for consent forms
    - `consent_form_template_sections` - Sections within templates
    - `consent_form_template_fields` - Fields within sections
    - `aftercare_templates` - Templates for aftercare emails
  
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create consent_form_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS consent_form_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requires_medical_history BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent_form_template_sections table if it doesn't exist
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

-- Create consent_form_template_fields table if it doesn't exist
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

-- Create aftercare_templates table if it doesn't exist
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

-- Enable RLS on all tables
ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_templates ENABLE ROW LEVEL SECURITY;

-- Create admin policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Admins can manage consent form templates" ON consent_form_templates;
  DROP POLICY IF EXISTS "Admins can manage consent form template sections" ON consent_form_template_sections;
  DROP POLICY IF EXISTS "Admins can manage consent form template fields" ON consent_form_template_fields;
  DROP POLICY IF EXISTS "Admins can manage aftercare templates" ON aftercare_templates;
  
  -- Create new policies
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
END $$;