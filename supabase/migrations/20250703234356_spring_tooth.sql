/*
  # Consent Module Implementation

  1. New Tables
    - `consent_forms` - Stores form templates
    - `form_submissions` - Stores completed consent forms
    - `consent_form_sections` - Organizes form structure
    - `consent_form_fields` - Defines form fields
    - `consent_qr_codes` - Manages QR codes for scanning
    - `artist_client_consents` - Tracks relationships between artists and clients
    - `consent_notifications` - Handles notifications for form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for clients, artists, and event managers
    - Create functions and triggers for notifications and QR code generation

  3. Changes
    - Add indexes for better performance
    - Create functions for notifications and QR code generation
*/

-- Create consent_forms table
CREATE TABLE IF NOT EXISTS consent_forms (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  requires_medical_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(form_id, client_id)
);

-- Create consent_form_sections table
CREATE TABLE IF NOT EXISTS consent_form_sections (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent_form_fields table
CREATE TABLE IF NOT EXISTS consent_form_fields (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES consent_form_sections(id) ON DELETE CASCADE,
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

-- Create consent_qr_codes table
CREATE TABLE IF NOT EXISTS consent_qr_codes (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  form_id INTEGER NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  scan_count INTEGER DEFAULT 0
);

-- Create artist_client_consents table to track relationships
CREATE TABLE IF NOT EXISTS artist_client_consents (
  id SERIAL PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  submission_id INTEGER REFERENCES form_submissions(id) ON DELETE SET NULL,
  procedure_type TEXT NOT NULL,
  procedure_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(artist_id, client_id, event_id, procedure_type)
);

-- Create consent_notifications table
CREATE TABLE IF NOT EXISTS consent_notifications (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consent_forms_event_id ON consent_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_consent_form_sections_form_id ON consent_form_sections(form_id);
CREATE INDEX IF NOT EXISTS idx_consent_form_fields_section_id ON consent_form_fields(section_id);
CREATE INDEX IF NOT EXISTS idx_consent_qr_codes_event_id ON consent_qr_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_consent_qr_codes_form_id ON consent_qr_codes(form_id);
CREATE INDEX IF NOT EXISTS idx_artist_client_consents_artist_id ON artist_client_consents(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_client_consents_client_id ON artist_client_consents(client_id);
CREATE INDEX IF NOT EXISTS idx_artist_client_consents_event_id ON artist_client_consents(event_id);
CREATE INDEX IF NOT EXISTS idx_consent_notifications_submission_id ON consent_notifications(submission_id);
CREATE INDEX IF NOT EXISTS idx_consent_notifications_recipient_id ON consent_notifications(recipient_id);

-- Enable RLS
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_client_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_forms
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_forms' AND policyname = 'Clients can read consent forms for events they''re attending'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Clients can read consent forms for events they're attending"
        ON consent_forms
        FOR SELECT
        TO authenticated
        USING (
          (is_active = true) AND 
          (EXISTS (
            SELECT 1
            FROM tickets t
            WHERE t.event_id = consent_forms.event_id
            AND t.client_id = auth.uid()
          ))
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_forms' AND policyname = 'Event managers can manage their consent forms'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can manage their consent forms"
        ON consent_forms
        FOR ALL
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = consent_forms.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = 'admin'
          ))
        );
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for form_submissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_submissions' AND policyname = 'Clients can manage own form submissions'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Clients can manage own form submissions"
        ON form_submissions
        FOR ALL
        TO authenticated
        USING (
          client_id = auth.uid()
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_submissions' AND policyname = 'Event managers can read submissions for their events'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can read submissions for their events"
        ON form_submissions
        FOR SELECT
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            JOIN consent_forms cf ON e.id = cf.event_id
            WHERE cf.id = form_submissions.form_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = 'admin'
          ))
        );
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for consent_form_sections
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_form_sections' AND policyname = 'Anyone can read consent form sections'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Anyone can read consent form sections"
        ON consent_form_sections
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM consent_forms cf
            WHERE cf.id = consent_form_sections.form_id
            AND cf.is_active = true
          )
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_form_sections' AND policyname = 'Event managers can manage consent form sections'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can manage consent form sections"
        ON consent_form_sections
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM consent_forms cf
            JOIN events e ON e.id = cf.event_id
            WHERE cf.id = consent_form_sections.form_id
            AND e.event_manager_id = auth.uid()
          )
        );
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for consent_form_fields
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_form_fields' AND policyname = 'Anyone can read consent form fields'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Anyone can read consent form fields"
        ON consent_form_fields
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM consent_form_sections cfs
            JOIN consent_forms cf ON cf.id = cfs.form_id
            WHERE cfs.id = consent_form_fields.section_id
            AND cf.is_active = true
          )
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_form_fields' AND policyname = 'Event managers can manage consent form fields'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can manage consent form fields"
        ON consent_form_fields
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM consent_form_sections cfs
            JOIN consent_forms cf ON cf.id = cfs.form_id
            JOIN events e ON e.id = cf.event_id
            WHERE cfs.id = consent_form_fields.section_id
            AND e.event_manager_id = auth.uid()
          )
        );
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for consent_qr_codes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_qr_codes' AND policyname = 'Event managers can manage QR codes'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can manage QR codes"
        ON consent_qr_codes
        FOR ALL
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = consent_qr_codes.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = 'admin'
          ))
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_qr_codes' AND policyname = 'Anyone can read QR codes'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Anyone can read QR codes"
        ON consent_qr_codes
        FOR SELECT
        TO authenticated
        USING (true);
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for artist_client_consents
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artist_client_consents' AND policyname = 'Artists can view their client consents'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Artists can view their client consents"
        ON artist_client_consents
        FOR SELECT
        TO authenticated
        USING (
          artist_id = auth.uid()
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artist_client_consents' AND policyname = 'Clients can view their artist consents'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Clients can view their artist consents"
        ON artist_client_consents
        FOR SELECT
        TO authenticated
        USING (
          client_id = auth.uid()
        );
    $POLICY$;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artist_client_consents' AND policyname = 'Event managers can view all consents for their events'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Event managers can view all consents for their events"
        ON artist_client_consents
        FOR SELECT
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = artist_client_consents.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = 'admin'
          ))
        );
    $POLICY$;
  END IF;
END $$;

-- RLS Policies for consent_notifications
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consent_notifications' AND policyname = 'Users can manage their own notifications'
  ) THEN
    EXECUTE $POLICY$
      CREATE POLICY "Users can manage their own notifications"
        ON consent_notifications
        FOR ALL
        TO authenticated
        USING (
          recipient_id = auth.uid()
        );
    $POLICY$;
  END IF;
END $$;

-- Function to create notification when form is submitted
CREATE OR REPLACE FUNCTION create_consent_notification()
RETURNS TRIGGER AS $$
DECLARE
  artist_id UUID;
BEGIN
  -- Find the artist associated with this submission
  SELECT acc.artist_id INTO artist_id
  FROM artist_client_consents acc
  WHERE acc.submission_id = NEW.id;
  
  -- Create notification for the artist
  IF artist_id IS NOT NULL THEN
    INSERT INTO consent_notifications (submission_id, recipient_id)
    VALUES (NEW.id, artist_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_consent_notification ON form_submissions;

-- Trigger to create notification on form submission
CREATE TRIGGER trigger_create_consent_notification
AFTER INSERT ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION create_consent_notification();

-- Function to generate unique QR code
CREATE OR REPLACE FUNCTION generate_consent_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a unique code if not provided
  IF NEW.code IS NULL THEN
    NEW.code = 'CONSENT-' || NEW.event_id || '-' || NEW.form_id || '-' || FLOOR(RANDOM() * 1000000)::TEXT;
  END IF;
  
  -- Set default expiration if not provided
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_generate_consent_qr_code ON consent_qr_codes;

-- Trigger to generate QR code
CREATE TRIGGER trigger_generate_consent_qr_code
BEFORE INSERT ON consent_qr_codes
FOR EACH ROW
EXECUTE FUNCTION generate_consent_qr_code();

-- Update event_modules table to include consent_forms_enabled if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_modules' 
    AND column_name = 'consent_forms_enabled'
  ) THEN
    -- Column doesn't exist, so we don't need to do anything
    -- It was already added in a previous migration
    NULL;
  END IF;
END $$;