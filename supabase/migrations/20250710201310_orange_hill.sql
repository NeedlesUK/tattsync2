/*
  # Ensure template tables exist

  1. New Tables
    - `consent_form_templates` - Master templates for consent forms
    - `aftercare_templates` - Templates for aftercare emails
  2. Security
    - Enable RLS on both tables
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

-- Enable RLS on both tables
ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_templates ENABLE ROW LEVEL SECURITY;

-- Create admin policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Admins can manage consent form templates" ON consent_form_templates;
  EXCEPTION
    WHEN undefined_object THEN
      -- Policy doesn't exist, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Admins can manage aftercare templates" ON aftercare_templates;
  EXCEPTION
    WHEN undefined_object THEN
      -- Policy doesn't exist, continue
  END;
  
  -- Create new policies
  CREATE POLICY "Admins can manage consent form templates" 
    ON consent_form_templates
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

  CREATE POLICY "Admins can manage aftercare templates" 
    ON aftercare_templates
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
END $$;