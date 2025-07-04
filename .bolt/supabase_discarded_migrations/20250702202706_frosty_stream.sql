/*
  # Application Management System

  1. New Tables
    - `application_settings` - Event-specific application configurations
    - `email_templates` - Customizable email templates for approval/rejection
    - `application_limits` - Track application limits and current counts per type

  2. Enhanced Applications Table
    - Add email tracking fields
    - Add registration link expiration
    - Add registration completion tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for event managers and admins
    - Create indexes for performance

  4. Automation
    - Trigger to automatically update application counts
    - Default email templates for existing events
*/

-- Create application_settings table
CREATE TABLE IF NOT EXISTS application_settings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_types JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('approval', 'rejection')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, template_type)
);

-- Create application_limits table
CREATE TABLE IF NOT EXISTS application_limits (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  max_applications INTEGER NOT NULL DEFAULT 0,
  current_applications INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, application_type)
);

-- Add email tracking fields to applications
DO $$
BEGIN
  -- Add approval_email_sent field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'approval_email_sent'
  ) THEN
    ALTER TABLE applications ADD COLUMN approval_email_sent TIMESTAMPTZ;
  END IF;

  -- Add rejection_email_sent field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'rejection_email_sent'
  ) THEN
    ALTER TABLE applications ADD COLUMN rejection_email_sent TIMESTAMPTZ;
  END IF;

  -- Add registration_link_expires field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'registration_link_expires'
  ) THEN
    ALTER TABLE applications ADD COLUMN registration_link_expires TIMESTAMPTZ;
  END IF;

  -- Add registration_completed field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'registration_completed'
  ) THEN
    ALTER TABLE applications ADD COLUMN registration_completed TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_settings_event_id ON application_settings(event_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_event_id ON email_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_application_limits_event_id ON application_limits(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_status_event_id ON applications(status, event_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Enable RLS
ALTER TABLE application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_settings
CREATE POLICY "Event managers can manage their application settings"
  ON application_settings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = application_settings.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'admin'
    )
  );

-- RLS Policies for email_templates
CREATE POLICY "Event managers can manage their email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = email_templates.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'admin'
    )
  );

-- RLS Policies for application_limits
CREATE POLICY "Event managers can manage their application limits"
  ON application_limits
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = application_limits.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'admin'
    )
  );

-- Insert default email templates for existing events
INSERT INTO email_templates (event_id, template_type, subject, message)
SELECT 
  e.id,
  'approval',
  'Your application has been approved - {event_name}',
  'Dear {applicant_name},

Congratulations! Your application to participate in {event_name} as a {application_type} has been approved.

You have 7 days to complete your registration. Please click the link below to proceed:
{registration_link}

If you have any questions, please don''t hesitate to contact us.

Best regards,
The {event_name} Team'
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates et 
  WHERE et.event_id = e.id AND et.template_type = 'approval'
);

INSERT INTO email_templates (event_id, template_type, subject, message)
SELECT 
  e.id,
  'rejection',
  'Application Update - {event_name}',
  'Dear {applicant_name},

Thank you for your interest in participating in {event_name} as a {application_type}.

Unfortunately, we are unable to approve your application at this time. This may be due to limited spaces or specific requirements for this event.

We encourage you to apply for future events and wish you all the best.

Best regards,
The {event_name} Team'
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates et 
  WHERE et.event_id = e.id AND et.template_type = 'rejection'
);

-- Function to update application counts
CREATE OR REPLACE FUNCTION update_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count for new application
    INSERT INTO application_limits (event_id, application_type, current_applications)
    VALUES (NEW.event_id, NEW.application_type, 1)
    ON CONFLICT (event_id, application_type)
    DO UPDATE SET current_applications = application_limits.current_applications + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count for deleted application
    UPDATE application_limits 
    SET current_applications = GREATEST(0, current_applications - 1)
    WHERE event_id = OLD.event_id AND application_type = OLD.application_type;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update application counts
DROP TRIGGER IF EXISTS trigger_update_application_count ON applications;
CREATE TRIGGER trigger_update_application_count
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_application_count();