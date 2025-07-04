/*
  # Update Applications Schema for Dynamic Forms

  1. Schema Changes
    - Update applications table to support dynamic form data
    - Add form_data JSONB column for flexible field storage
    - Update application types to match requirements
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - Ensure form data is properly validated
*/

-- Update applications table to support dynamic form data
DO $$
BEGIN
  -- Add form_data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'form_data'
  ) THEN
    ALTER TABLE applications ADD COLUMN form_data JSONB DEFAULT '{}';
  END IF;

  -- Add name field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_name'
  ) THEN
    ALTER TABLE applications ADD COLUMN applicant_name TEXT;
  END IF;

  -- Add email field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_email'
  ) THEN
    ALTER TABLE applications ADD COLUMN applicant_email TEXT;
  END IF;

  -- Add date of birth field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE applications ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add telephone field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'telephone'
  ) THEN
    ALTER TABLE applications ADD COLUMN telephone TEXT;
  END IF;
END $$;

-- Create index on form_data for better performance
CREATE INDEX IF NOT EXISTS idx_applications_form_data ON applications USING GIN (form_data);

-- Create index on applicant_email for lookups
CREATE INDEX IF NOT EXISTS idx_applications_applicant_email ON applications (applicant_email);

-- Update the application_type enum to ensure all types are included
DO $$
BEGIN
  -- Check if we need to add any missing application types
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'caterer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_type')
  ) THEN
    ALTER TYPE application_type ADD VALUE 'caterer';
  END IF;
END $$;