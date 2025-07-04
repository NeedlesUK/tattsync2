/*
  # Payment Pricing System

  1. New Tables
    - `payment_pricing_settings`
      - `id` (serial, primary key)
      - `event_id` (integer, references events)
      - `application_type` (application_type enum)
      - `enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_pricing_tiers`
      - `id` (serial, primary key)
      - `pricing_setting_id` (integer, references payment_pricing_settings)
      - `tier_name` (text)
      - `months_before_event` (integer)
      - `full_price` (decimal)
      - `installment_3_total` (decimal)
      - `installment_6_total` (decimal)
      - `installment_3_enabled` (boolean)
      - `installment_6_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for event managers to manage pricing
    - Add policies for public to read pricing for published events

  3. Functions
    - `get_current_pricing_tier()` - Returns appropriate pricing tier based on event date

  4. Default Data
    - Creates default pricing settings for all application types
    - Inserts sample pricing tiers for each application type
*/

-- Create payment_pricing_settings table
CREATE TABLE IF NOT EXISTS payment_pricing_settings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, application_type)
);

-- Create payment_pricing_tiers table
CREATE TABLE IF NOT EXISTS payment_pricing_tiers (
  id SERIAL PRIMARY KEY,
  pricing_setting_id INTEGER NOT NULL REFERENCES payment_pricing_settings(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  months_before_event INTEGER NOT NULL DEFAULT 0,
  full_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  installment_3_total DECIMAL(10,2) DEFAULT 0.00,
  installment_6_total DECIMAL(10,2) DEFAULT 0.00,
  installment_3_enabled BOOLEAN DEFAULT false,
  installment_6_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_pricing_settings_event_type ON payment_pricing_settings(event_id, application_type);
CREATE INDEX IF NOT EXISTS idx_payment_pricing_tiers_setting_id ON payment_pricing_tiers(pricing_setting_id);
CREATE INDEX IF NOT EXISTS idx_payment_pricing_tiers_months ON payment_pricing_tiers(months_before_event);

-- Enable RLS
ALTER TABLE payment_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_pricing_settings
CREATE POLICY "Event managers can manage pricing settings"
  ON payment_pricing_settings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = payment_pricing_settings.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

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

-- RLS Policies for payment_pricing_tiers
CREATE POLICY "Event managers can manage pricing tiers"
  ON payment_pricing_tiers
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      JOIN payment_pricing_settings pps ON pps.event_id = e.id
      WHERE pps.id = payment_pricing_tiers.pricing_setting_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Anyone can read pricing tiers for published events"
  ON payment_pricing_tiers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN payment_pricing_settings pps ON pps.event_id = e.id
      WHERE pps.id = payment_pricing_tiers.pricing_setting_id
      AND e.status = 'published'
    )
  );

-- Insert default pricing settings for existing events - Artists
INSERT INTO payment_pricing_settings (event_id, application_type, enabled)
SELECT e.id, 'artist'::application_type, true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM payment_pricing_settings pps 
  WHERE pps.event_id = e.id 
  AND pps.application_type = 'artist'::application_type
);

-- Insert default pricing settings for existing events - Piercers
INSERT INTO payment_pricing_settings (event_id, application_type, enabled)
SELECT e.id, 'piercer'::application_type, true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM payment_pricing_settings pps 
  WHERE pps.event_id = e.id 
  AND pps.application_type = 'piercer'::application_type
);

-- Insert default pricing settings for existing events - Traders
INSERT INTO payment_pricing_settings (event_id, application_type, enabled)
SELECT e.id, 'trader'::application_type, true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM payment_pricing_settings pps 
  WHERE pps.event_id = e.id 
  AND pps.application_type = 'trader'::application_type
);

-- Insert default pricing settings for existing events - Caterers
INSERT INTO payment_pricing_settings (event_id, application_type, enabled)
SELECT e.id, 'caterer'::application_type, true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM payment_pricing_settings pps 
  WHERE pps.event_id = e.id 
  AND pps.application_type = 'caterer'::application_type
);

-- Insert default pricing tiers for artists
INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Early Bird (8+ months)',
  8,
  275.00,
  300.00,
  300.00,
  true,
  true
FROM payment_pricing_settings pps
WHERE pps.application_type = 'artist'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Early Bird (8+ months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Standard (5-7 months)',
  5,
  275.00,
  300.00,
  0.00,
  true,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'artist'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Standard (5-7 months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Late Registration (0-4 months)',
  0,
  275.00,
  0.00,
  0.00,
  false,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'artist'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Late Registration (0-4 months)'
);

-- Insert default pricing tiers for piercers
INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Early Bird (8+ months)',
  8,
  225.00,
  250.00,
  250.00,
  true,
  true
FROM payment_pricing_settings pps
WHERE pps.application_type = 'piercer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Early Bird (8+ months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Standard (5-7 months)',
  5,
  225.00,
  250.00,
  0.00,
  true,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'piercer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Standard (5-7 months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Late Registration (0-4 months)',
  0,
  225.00,
  0.00,
  0.00,
  false,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'piercer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Late Registration (0-4 months)'
);

-- Insert default pricing tiers for traders
INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Early Bird (8+ months)',
  8,
  350.00,
  375.00,
  375.00,
  true,
  true
FROM payment_pricing_settings pps
WHERE pps.application_type = 'trader'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Early Bird (8+ months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Standard (5-7 months)',
  5,
  350.00,
  375.00,
  0.00,
  true,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'trader'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Standard (5-7 months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Late Registration (0-4 months)',
  0,
  350.00,
  0.00,
  0.00,
  false,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'trader'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Late Registration (0-4 months)'
);

-- Insert default pricing tiers for caterers
INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Early Bird (8+ months)',
  8,
  450.00,
  475.00,
  475.00,
  true,
  true
FROM payment_pricing_settings pps
WHERE pps.application_type = 'caterer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Early Bird (8+ months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Standard (5-7 months)',
  5,
  450.00,
  475.00,
  0.00,
  true,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'caterer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Standard (5-7 months)'
);

INSERT INTO payment_pricing_tiers (pricing_setting_id, tier_name, months_before_event, full_price, installment_3_total, installment_6_total, installment_3_enabled, installment_6_enabled)
SELECT 
  pps.id,
  'Late Registration (0-4 months)',
  0,
  450.00,
  0.00,
  0.00,
  false,
  false
FROM payment_pricing_settings pps
WHERE pps.application_type = 'caterer'::application_type
AND NOT EXISTS (
  SELECT 1 FROM payment_pricing_tiers ppt 
  WHERE ppt.pricing_setting_id = pps.id
  AND ppt.tier_name = 'Late Registration (0-4 months)'
);

-- Function to get current pricing tier for an application type and event
CREATE OR REPLACE FUNCTION get_current_pricing_tier(
  p_event_id INTEGER,
  p_application_type application_type
)
RETURNS TABLE (
  tier_id INTEGER,
  tier_name TEXT,
  full_price DECIMAL(10,2),
  installment_3_total DECIMAL(10,2),
  installment_6_total DECIMAL(10,2),
  installment_3_enabled BOOLEAN,
  installment_6_enabled BOOLEAN
) AS $$
DECLARE
  event_date DATE;
  months_until_event INTEGER;
BEGIN
  -- Get event date
  SELECT start_date INTO event_date
  FROM events
  WHERE id = p_event_id;
  
  -- Calculate months until event
  months_until_event := EXTRACT(YEAR FROM AGE(event_date, CURRENT_DATE)) * 12 + 
                       EXTRACT(MONTH FROM AGE(event_date, CURRENT_DATE));
  
  -- Return the appropriate pricing tier
  RETURN QUERY
  SELECT 
    ppt.id,
    ppt.tier_name,
    ppt.full_price,
    ppt.installment_3_total,
    ppt.installment_6_total,
    ppt.installment_3_enabled,
    ppt.installment_6_enabled
  FROM payment_pricing_tiers ppt
  JOIN payment_pricing_settings pps ON pps.id = ppt.pricing_setting_id
  WHERE pps.event_id = p_event_id
  AND pps.application_type = p_application_type
  AND pps.enabled = true
  AND months_until_event >= ppt.months_before_event
  ORDER BY ppt.months_before_event DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;