/*
  # Create payment pricing settings and tiers tables

  1. New Tables
    - `payment_pricing_settings` - Stores pricing settings for each application type
      - `id` (serial, primary key)
      - `event_id` (integer, references events)
      - `application_type` (application_type enum)
      - `enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `payment_pricing_tiers` - Stores pricing tiers for each pricing setting
      - `id` (serial, primary key)
      - `pricing_setting_id` (integer, references payment_pricing_settings)
      - `tier_name` (text)
      - `months_before_event` (integer)
      - `full_price` (numeric)
      - `installment_3_total` (numeric)
      - `installment_6_total` (numeric)
      - `installment_3_enabled` (boolean)
      - `installment_6_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for reading and managing pricing settings and tiers
*/

-- Create payment_pricing_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_pricing_settings') THEN
    CREATE TABLE payment_pricing_settings (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      application_type application_type NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Create unique constraint on event_id and application_type
    ALTER TABLE payment_pricing_settings 
      ADD CONSTRAINT payment_pricing_settings_event_id_application_type_key 
      UNIQUE (event_id, application_type);
    
    -- Create index for faster lookups
    CREATE INDEX idx_payment_pricing_settings_event_type 
      ON payment_pricing_settings(event_id, application_type);
  END IF;
END $$;

-- Create payment_pricing_tiers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_pricing_tiers') THEN
    CREATE TABLE payment_pricing_tiers (
      id SERIAL PRIMARY KEY,
      pricing_setting_id INTEGER NOT NULL REFERENCES payment_pricing_settings(id) ON DELETE CASCADE,
      tier_name TEXT NOT NULL,
      months_before_event INTEGER NOT NULL DEFAULT 0,
      full_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      installment_3_total NUMERIC(10,2),
      installment_6_total NUMERIC(10,2),
      installment_3_enabled BOOLEAN DEFAULT false,
      installment_6_enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Create indexes for faster lookups
    CREATE INDEX idx_payment_pricing_tiers_setting_id 
      ON payment_pricing_tiers(pricing_setting_id);
    
    CREATE INDEX idx_payment_pricing_tiers_months 
      ON payment_pricing_tiers(months_before_event);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE payment_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_pricing_settings if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_pricing_settings' AND policyname = 'Anyone can read pricing settings for published events') THEN
    CREATE POLICY "Anyone can read pricing settings for published events"
      ON payment_pricing_settings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM events e
          WHERE e.id = payment_pricing_settings.event_id
          AND e.status = 'published'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_pricing_settings' AND policyname = 'Event managers can manage pricing settings') THEN
    CREATE POLICY "Event managers can manage pricing settings"
      ON payment_pricing_settings
      FOR ALL
      TO authenticated
      USING (
        uid() IN (
          SELECT e.event_manager_id
          FROM events e
          WHERE e.id = payment_pricing_settings.event_id
          AND e.event_manager_id IS NOT NULL
        )
      );
  END IF;
END $$;

-- Create policies for payment_pricing_tiers if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_pricing_tiers' AND policyname = 'Anyone can read pricing tiers for published events') THEN
    CREATE POLICY "Anyone can read pricing tiers for published events"
      ON payment_pricing_tiers
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM events e
          JOIN payment_pricing_settings pps ON pps.event_id = e.id
          WHERE pps.id = payment_pricing_tiers.pricing_setting_id
          AND e.status = 'published'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_pricing_tiers' AND policyname = 'Event managers can manage pricing tiers') THEN
    CREATE POLICY "Event managers can manage pricing tiers"
      ON payment_pricing_tiers
      FOR ALL
      TO authenticated
      USING (
        uid() IN (
          SELECT e.event_manager_id
          FROM events e
          JOIN payment_pricing_settings pps ON pps.event_id = e.id
          WHERE pps.id = payment_pricing_tiers.pricing_setting_id
          AND e.event_manager_id IS NOT NULL
        )
      );
  END IF;
END $$;