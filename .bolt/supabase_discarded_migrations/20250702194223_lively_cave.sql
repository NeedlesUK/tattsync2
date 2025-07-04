/*
  # Add Client Support and Calendar Features

  1. New Tables
    - `clients` - For ticket purchasers with automatic registration
    - `event_modules` - To track which modules are enabled per event
    - `consent_forms` - For event-specific consent and medical forms
    - `form_submissions` - To track client form submissions
    - `event_calendar` - For displaying events in user calendars

  2. Updates
    - Add `client` to user_role enum
    - Add ticketing and consent modules to events
    - Add GBP currency support

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each user type
*/

-- Add client to user_role enum
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'client';
EXCEPTION
    WHEN invalid_text_representation THEN null;
END $$;

-- Clients table for ticket purchasers
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text,
  allergies text,
  medications text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event modules configuration
CREATE TABLE IF NOT EXISTS event_modules (
  id serial PRIMARY KEY,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticketing_enabled boolean DEFAULT false,
  applications_enabled boolean DEFAULT true,
  consent_forms_enabled boolean DEFAULT false,
  deals_enabled boolean DEFAULT false,
  messaging_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id)
);

-- Consent forms for events
CREATE TABLE IF NOT EXISTS consent_forms (
  id serial PRIMARY KEY,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  form_fields jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  requires_medical_history boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Form submissions from clients
CREATE TABLE IF NOT EXISTS form_submissions (
  id serial PRIMARY KEY,
  form_id integer NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_data jsonb NOT NULL DEFAULT '{}',
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(form_id, client_id)
);

-- Tickets table for event attendance
CREATE TABLE IF NOT EXISTS tickets (
  id serial PRIMARY KEY,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ticket_type text NOT NULL DEFAULT 'general',
  price_gbp decimal(10,2) NOT NULL DEFAULT 0.00,
  purchase_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  qr_code text,
  UNIQUE(event_id, client_id, ticket_type)
);

-- User calendar events (for showing other TattSync events)
CREATE TABLE IF NOT EXISTS user_calendar_events (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('applied', 'attending', 'interested', 'managing')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on all new tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_events ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can insert own data"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Event modules policies
CREATE POLICY "Event managers can manage their event modules"
  ON event_modules
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id 
      FROM events e 
      WHERE e.id = event_modules.event_id AND e.event_manager_id IS NOT NULL
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Anyone can read event modules for published events"
  ON event_modules
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id 
      FROM events e 
      WHERE e.id = event_modules.event_id
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin') OR
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_modules.event_id AND e.status = 'published'
    )
  );

-- Consent forms policies
CREATE POLICY "Event managers can manage their consent forms"
  ON consent_forms
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id 
      FROM events e 
      WHERE e.id = consent_forms.event_id AND e.event_manager_id IS NOT NULL
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Clients can read consent forms for events they're attending"
  ON consent_forms
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.event_id = consent_forms.event_id AND t.client_id = auth.uid()
    )
  );

-- Form submissions policies
CREATE POLICY "Clients can manage own form submissions"
  ON form_submissions
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Event managers can read submissions for their events"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id 
      FROM events e 
      JOIN consent_forms cf ON e.id = cf.event_id
      WHERE cf.id = form_submissions.form_id AND e.event_manager_id IS NOT NULL
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Tickets policies
CREATE POLICY "Clients can read own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Event managers can read tickets for their events"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id 
      FROM events e 
      WHERE e.id = tickets.event_id AND e.event_manager_id IS NOT NULL
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Calendar events policies
CREATE POLICY "Users can manage own calendar events"
  ON user_calendar_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_event_modules_event_id ON event_modules(event_id);
CREATE INDEX IF NOT EXISTS idx_consent_forms_event_id ON consent_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_events_user_id ON user_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_events_event_id ON user_calendar_events(event_id);

-- Insert default event modules for existing events
INSERT INTO event_modules (event_id, applications_enabled, consent_forms_enabled, ticketing_enabled)
SELECT id, true, false, false FROM events
ON CONFLICT (event_id) DO NOTHING;

-- Insert sample consent forms
INSERT INTO consent_forms (event_id, title, description, form_fields, requires_medical_history) VALUES
(
  (SELECT id FROM events WHERE event_slug = 'ink-fest-2024' LIMIT 1),
  'Tattoo Consent Form',
  'Required consent form for all tattoo procedures at Ink Fest 2024',
  '[
    {"type": "text", "name": "full_name", "label": "Full Name", "required": true},
    {"type": "date", "name": "date_of_birth", "label": "Date of Birth", "required": true},
    {"type": "textarea", "name": "medical_conditions", "label": "Medical Conditions", "required": false},
    {"type": "textarea", "name": "allergies", "label": "Known Allergies", "required": false},
    {"type": "checkbox", "name": "consent_given", "label": "I consent to the tattoo procedure", "required": true}
  ]'::jsonb,
  true
),
(
  (SELECT id FROM events WHERE event_slug = 'body-art-expo-2024' LIMIT 1),
  'General Waiver',
  'General liability waiver for Body Art Expo participation',
  '[
    {"type": "text", "name": "full_name", "label": "Full Name", "required": true},
    {"type": "text", "name": "emergency_contact", "label": "Emergency Contact", "required": true},
    {"type": "text", "name": "emergency_phone", "label": "Emergency Contact Phone", "required": true},
    {"type": "checkbox", "name": "waiver_accepted", "label": "I accept the terms and conditions", "required": true}
  ]'::jsonb,
  false
)
ON CONFLICT DO NOTHING;