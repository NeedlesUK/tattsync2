/*
  # Update Application Access Control

  1. Security Updates
    - Update RLS policies to restrict access properly
    - Ensure only Event Managers and Event Admins can see applications
    - Remove access for TattScore Admins and Master Admins

  2. User Account Integration
    - Add support for existing user account applications
    - Add profile update tracking
*/

-- Update applications RLS policies to restrict access properly
DROP POLICY IF EXISTS "Users can read own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Event managers can manage applications" ON applications;

-- New restrictive policies for applications
CREATE POLICY "Event managers and admins can read applications for their events"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    -- Event managers can see applications for their events
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = applications.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR
    -- Event admins can see applications for events they manage
    auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = applications.event_id
        AND e.event_manager_id = users.id
      )
    )
    OR
    -- Users can see their own applications
    auth.uid() = applications.user_id
  );

CREATE POLICY "Event managers and admins can manage applications for their events"
  ON applications
  FOR ALL
  TO authenticated
  USING (
    -- Event managers can manage applications for their events
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = applications.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR
    -- Event admins can manage applications for events they manage
    auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = applications.event_id
        AND e.event_manager_id = users.id
      )
    )
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = applications.event_id
      AND e.event_manager_id IS NOT NULL
    )
    OR
    auth.uid() IN (
      SELECT users.id
      FROM users
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = applications.event_id
        AND e.event_manager_id = users.id
      )
    )
    OR
    -- Users can create applications for themselves
    auth.uid() = applications.user_id
  );

-- Add fields to track user account usage and profile updates
DO $$
BEGIN
  -- Add field to track if application was made with existing account
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'used_existing_account'
  ) THEN
    ALTER TABLE applications ADD COLUMN used_existing_account BOOLEAN DEFAULT false;
  END IF;

  -- Add field to track if profile was updated before application
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'profile_updated_at'
  ) THEN
    ALTER TABLE applications ADD COLUMN profile_updated_at TIMESTAMPTZ;
  END IF;

  -- Add field to store original user profile data at time of application
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'user_profile_snapshot'
  ) THEN
    ALTER TABLE applications ADD COLUMN user_profile_snapshot JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create index for better performance on account-based applications
CREATE INDEX IF NOT EXISTS idx_applications_used_existing_account ON applications(used_existing_account);
CREATE INDEX IF NOT EXISTS idx_applications_profile_updated_at ON applications(profile_updated_at);

-- Update the application_settings policies to be more restrictive
DROP POLICY IF EXISTS "Event managers can manage their application settings" ON application_settings;

CREATE POLICY "Event managers and admins can manage application settings"
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
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = application_settings.event_id
        AND e.event_manager_id = users.id
      )
    )
  );

-- Update email_templates policies
DROP POLICY IF EXISTS "Event managers can manage their email templates" ON email_templates;

CREATE POLICY "Event managers and admins can manage email templates"
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
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = email_templates.event_id
        AND e.event_manager_id = users.id
      )
    )
  );

-- Update application_limits policies
DROP POLICY IF EXISTS "Event managers can manage their application limits" ON application_limits;

CREATE POLICY "Event managers and admins can manage application limits"
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
      WHERE users.role = 'event_admin'
      AND EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = application_limits.event_id
        AND e.event_manager_id = users.id
      )
    )
  );