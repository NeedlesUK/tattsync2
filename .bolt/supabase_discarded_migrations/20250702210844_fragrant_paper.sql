/*
  # Registration System Implementation

  1. New Tables
    - `registration_tokens` - Secure tokens for registration links
    - `registration_requirements` - Event-specific registration requirements per application type
    - `payment_settings` - Payment configuration per event
    - `registration_submissions` - Completed registrations
    - `payment_plans` - Installment payment tracking

  2. Enhanced Applications
    - Added performer-specific fields (price range, requirements)
    - Added registration token reference

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for event managers and users

  4. Default Data
    - Insert default requirements and payment settings for existing events
*/

-- Create registration_tokens table for secure registration links
CREATE TABLE IF NOT EXISTS registration_tokens (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(application_id)
);

-- Create registration_requirements table for event-specific requirements
CREATE TABLE IF NOT EXISTS registration_requirements (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  requires_payment BOOLEAN DEFAULT true,
  payment_amount DECIMAL(10,2) DEFAULT 0.00,
  agreement_text TEXT NOT NULL,
  profile_deadline_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, application_type)
);

-- Create payment_settings table for event payment configuration
CREATE TABLE IF NOT EXISTS payment_settings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  cash_enabled BOOLEAN DEFAULT true,
  cash_details TEXT,
  bank_transfer_enabled BOOLEAN DEFAULT true,
  bank_details TEXT,
  stripe_enabled BOOLEAN DEFAULT false,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  allow_installments BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

-- Create registration_submissions table for completed registrations
CREATE TABLE IF NOT EXISTS registration_submissions (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  confirmed_details JSONB DEFAULT '{}',
  agreement_accepted BOOLEAN DEFAULT false,
  agreement_accepted_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'stripe_full', 'stripe_3_installments', 'stripe_6_installments')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_amount DECIMAL(10,2),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  profile_deadline TIMESTAMPTZ,
  profile_completed_at TIMESTAMPTZ
);

-- Create payment_plans table for tracking installments
CREATE TABLE IF NOT EXISTS payment_plans (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES registration_submissions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add performer-specific fields to applications
DO $$
BEGIN
  -- Add performance price range fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'performance_price_from'
  ) THEN
    ALTER TABLE applications ADD COLUMN performance_price_from DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'performance_price_to'
  ) THEN
    ALTER TABLE applications ADD COLUMN performance_price_to DECIMAL(10,2);
  END IF;

  -- Add performance requirements field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'performance_requirements'
  ) THEN
    ALTER TABLE applications ADD COLUMN performance_requirements TEXT;
  END IF;

  -- Add registration token reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'registration_token'
  ) THEN
    ALTER TABLE applications ADD COLUMN registration_token TEXT;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_expires_at ON registration_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_requirements_event_type ON registration_requirements(event_id, application_type);
CREATE INDEX IF NOT EXISTS idx_payment_settings_event_id ON payment_settings(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_submissions_application_id ON registration_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_registration_submissions_client_id ON registration_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_registration_id ON payment_plans(registration_id);

-- Enable RLS
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registration_tokens
CREATE POLICY "Event managers can manage registration tokens"
  ON registration_tokens
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = registration_tokens.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Users can view their own registration tokens"
  ON registration_tokens
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      WHERE a.id = registration_tokens.application_id
    )
  );

-- RLS Policies for registration_requirements
CREATE POLICY "Event managers can manage registration requirements"
  ON registration_requirements
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = registration_requirements.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Anyone can read registration requirements for published events"
  ON registration_requirements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = registration_requirements.event_id
      AND e.status = 'published'
    )
  );

-- RLS Policies for payment_settings
CREATE POLICY "Event managers can manage payment settings"
  ON payment_settings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = payment_settings.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

-- RLS Policies for registration_submissions
CREATE POLICY "Event managers can view registrations for their events"
  ON registration_submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN applications a ON a.event_id = e.id
      WHERE a.id = registration_submissions.application_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Users can manage their own registrations"
  ON registration_submissions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      WHERE a.id = registration_submissions.application_id
    )
    OR auth.uid() = registration_submissions.client_id
  );

-- RLS Policies for payment_plans
CREATE POLICY "Users can view their own payment plans"
  ON payment_plans
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT a.user_id
      FROM applications a
      JOIN registration_submissions rs ON rs.application_id = a.id
      WHERE rs.id = payment_plans.registration_id
    )
    OR auth.uid() IN (
      SELECT rs.client_id
      FROM registration_submissions rs
      WHERE rs.id = payment_plans.registration_id
    )
  );

-- Insert default registration requirements for existing events - Artists
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'artist'::application_type,
  true,
  150.00,
  'I agree to participate as a tattoo artist and comply with all event regulations, health and safety requirements, and professional standards.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'artist'
);

-- Insert default registration requirements for existing events - Piercers
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'piercer'::application_type,
  true,
  120.00,
  'I agree to participate as a piercer and comply with all event regulations, health and safety requirements, and professional standards.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'piercer'
);

-- Insert default registration requirements for existing events - Performers
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'performer'::application_type,
  false,
  0.00,
  'I agree to perform at this event and comply with all performance guidelines, safety requirements, and event schedules.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'performer'
);

-- Insert default registration requirements for existing events - Traders
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'trader'::application_type,
  true,
  200.00,
  'I agree to trade at this event and comply with all trading regulations, product standards, and event policies.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'trader'
);

-- Insert default registration requirements for existing events - Volunteers
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'volunteer'::application_type,
  false,
  0.00,
  'I agree to volunteer at this event and comply with all volunteer guidelines, safety requirements, and assigned duties.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'volunteer'
);

-- Insert default registration requirements for existing events - Caterers
INSERT INTO registration_requirements (event_id, application_type, requires_payment, payment_amount, agreement_text, profile_deadline_days)
SELECT 
  e.id,
  'caterer'::application_type,
  true,
  300.00,
  'I agree to provide catering services and comply with all food safety regulations, hygiene standards, and event requirements.',
  30
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM registration_requirements rr 
  WHERE rr.event_id = e.id AND rr.application_type = 'caterer'
);

-- Insert default payment settings for existing events
INSERT INTO payment_settings (event_id, cash_enabled, cash_details, bank_transfer_enabled, bank_details, stripe_enabled, allow_installments)
SELECT 
  e.id,
  true,
  'Cash payments can be made at the event registration desk. Please bring exact change when possible.',
  true,
  'Bank transfers should be made to: Account Name: Event Organizer, Sort Code: 12-34-56, Account Number: 12345678. Please use your application reference as the payment reference.',
  false,
  true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM payment_settings ps 
  WHERE ps.event_id = e.id
);

-- Function to generate secure registration token
CREATE OR REPLACE FUNCTION generate_registration_token(app_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'base64');
  token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  
  -- Insert the token with 7-day expiry
  INSERT INTO registration_tokens (application_id, token, expires_at)
  VALUES (app_id, token, now() + interval '7 days')
  ON CONFLICT (application_id) 
  DO UPDATE SET 
    token = EXCLUDED.token,
    expires_at = EXCLUDED.expires_at,
    used_at = NULL;
  
  -- Update the application with the token reference
  UPDATE applications 
  SET registration_token = token,
      registration_link_expires = now() + interval '7 days'
  WHERE id = app_id;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;