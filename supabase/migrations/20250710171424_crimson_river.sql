/*
  # Create consent QR codes table

  1. New Tables
    - `consent_qr_codes`
      - `id` (integer, primary key)
      - `event_id` (integer, foreign key to events)
      - `form_id` (integer, foreign key to consent_forms)
      - `code` (text, unique)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `created_by` (uuid, foreign key to users)
      - `scan_count` (integer)
  
  2. Security
    - Enable RLS on `consent_qr_codes` table
    - Add policy for event managers to manage QR codes
    - Add policy for anyone to read QR codes
  
  3. Functions
    - Create function to generate unique QR codes
    - Create trigger to automatically generate code on insert
*/

-- Create consent QR codes table
CREATE TABLE IF NOT EXISTS consent_qr_codes (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  form_id INTEGER NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  scan_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consent_qr_codes_event_id ON consent_qr_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_consent_qr_codes_form_id ON consent_qr_codes(form_id);

-- Enable RLS
ALTER TABLE consent_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read QR codes"
  ON consent_qr_codes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Event managers can manage QR codes"
  ON consent_qr_codes
  FOR ALL
  TO authenticated
  USING (
    (auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = consent_qr_codes.event_id AND e.event_manager_id IS NOT NULL
    )) OR
    (auth.uid() IN (
      SELECT u.id
      FROM users u
      WHERE u.role = 'admin'
    ))
  );

-- Create function to generate unique QR codes
CREATE OR REPLACE FUNCTION generate_consent_qr_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate a random code until we find one that doesn't exist
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := substring(md5(random()::text) from 1 for 8);
    
    -- Check if this code already exists
    SELECT EXISTS (
      SELECT 1 FROM consent_qr_codes WHERE code = new_code
    ) INTO code_exists;
    
    -- If code doesn't exist, use it
    IF NOT code_exists THEN
      NEW.code := new_code;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate code on insert
CREATE TRIGGER trigger_generate_consent_qr_code
BEFORE INSERT ON consent_qr_codes
FOR EACH ROW
EXECUTE FUNCTION generate_consent_qr_code();