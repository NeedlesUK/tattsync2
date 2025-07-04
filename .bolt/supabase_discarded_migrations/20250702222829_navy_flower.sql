/*
  # Event Admin Settings and Deals Management

  1. New Tables
    - `event_information` - Shared information for event attendees
    - `event_deals` - Special offers and deals for event attendees
    - `global_deals` - System-wide deals managed by master admin
    - `deal_assignments` - Mapping of deals to events and application types

  2. Security
    - Enable RLS on all tables
    - Create policies for event managers and admin access
    - Create policies for attendee access to relevant information

  3. Changes
    - Add information and deals access to attendee profiles
*/

-- Create event_information table for shared information
CREATE TABLE IF NOT EXISTS event_information (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  application_types application_type[] DEFAULT ARRAY[]::application_type[], -- Empty array means visible to all types
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create event_deals table for event-specific deals
CREATE TABLE IF NOT EXISTS event_deals (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'special')),
  discount_value DECIMAL(10,2),
  discount_code TEXT,
  provider TEXT NOT NULL, -- Company/sponsor providing the deal
  provider_logo_url TEXT,
  application_types application_type[] DEFAULT ARRAY[]::application_type[], -- Empty array means visible to all types
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create global_deals table for system-wide deals (master admin only)
CREATE TABLE IF NOT EXISTS global_deals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'special')),
  discount_value DECIMAL(10,2),
  discount_code TEXT,
  provider TEXT NOT NULL,
  provider_logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal_assignments table to map global deals to events/types
CREATE TABLE IF NOT EXISTS deal_assignments (
  id SERIAL PRIMARY KEY,
  global_deal_id INTEGER NOT NULL REFERENCES global_deals(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  application_types application_type[] DEFAULT ARRAY[]::application_type[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_information_event ON event_information(event_id);
CREATE INDEX IF NOT EXISTS idx_event_deals_event ON event_deals(event_id);
CREATE INDEX IF NOT EXISTS idx_deal_assignments_event ON deal_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_deal_assignments_global_deal ON deal_assignments(global_deal_id);

-- Enable RLS
ALTER TABLE event_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_information
CREATE POLICY "Event managers can manage event information"
  ON event_information
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = event_information.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Attendees can read event information for their event"
  ON event_information
  FOR SELECT
  TO authenticated
  USING (
    (
      -- User has an approved application for this event
      EXISTS (
        SELECT 1 FROM applications a
        WHERE a.event_id = event_information.event_id
        AND a.user_id = auth.uid()
        AND a.status = 'approved'
      )
      -- And either the info is for all types or includes their type
      AND (
        array_length(event_information.application_types, 1) IS NULL
        OR
        EXISTS (
          SELECT 1 FROM applications a
          WHERE a.event_id = event_information.event_id
          AND a.user_id = auth.uid()
          AND a.application_type = ANY(event_information.application_types)
        )
      )
    )
    OR
    -- Or the event is published and the info is public
    (
      EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = event_information.event_id
        AND e.status = 'published'
      )
      AND array_length(event_information.application_types, 1) IS NULL
    )
  );

-- RLS Policies for event_deals
CREATE POLICY "Event managers can manage event deals"
  ON event_deals
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT e.event_manager_id
      FROM events e
      WHERE e.id = event_deals.event_id
      AND e.event_manager_id IS NOT NULL
    )
  );

CREATE POLICY "Attendees can read event deals for their event"
  ON event_deals
  FOR SELECT
  TO authenticated
  USING (
    (
      -- User has an approved application for this event
      EXISTS (
        SELECT 1 FROM applications a
        WHERE a.event_id = event_deals.event_id
        AND a.user_id = auth.uid()
        AND a.status = 'approved'
      )
      -- And either the deal is for all types or includes their type
      AND (
        array_length(event_deals.application_types, 1) IS NULL
        OR
        EXISTS (
          SELECT 1 FROM applications a
          WHERE a.event_id = event_deals.event_id
          AND a.user_id = auth.uid()
          AND a.application_type = ANY(event_deals.application_types)
        )
      )
    )
  );

-- RLS Policies for global_deals
CREATE POLICY "Only admins can manage global deals"
  ON global_deals
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Attendees can read assigned global deals"
  ON global_deals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deal_assignments da
      JOIN applications a ON (
        a.event_id = da.event_id OR da.event_id IS NULL
      )
      WHERE da.global_deal_id = global_deals.id
      AND a.user_id = auth.uid()
      AND a.status = 'approved'
      AND da.is_active = true
      AND global_deals.is_active = true
      AND (
        array_length(da.application_types, 1) IS NULL
        OR
        a.application_type = ANY(da.application_types)
      )
    )
  );

-- RLS Policies for deal_assignments
CREATE POLICY "Only admins can manage deal assignments"
  ON deal_assignments
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Function to get all deals for an attendee
CREATE OR REPLACE FUNCTION get_attendee_deals(p_user_id UUID, p_event_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value DECIMAL(10,2),
  discount_code TEXT,
  provider TEXT,
  provider_logo_url TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_global BOOLEAN
) AS $$
DECLARE
  user_app_type application_type;
BEGIN
  -- Get the user's application type for this event
  SELECT a.application_type INTO user_app_type
  FROM applications a
  WHERE a.user_id = p_user_id
  AND a.event_id = p_event_id
  AND a.status = 'approved';
  
  -- Return event-specific deals
  RETURN QUERY
  SELECT 
    ed.id,
    ed.title,
    ed.description,
    ed.discount_type,
    ed.discount_value,
    ed.discount_code,
    ed.provider,
    ed.provider_logo_url,
    ed.valid_from,
    ed.valid_until,
    false AS is_global
  FROM event_deals ed
  WHERE ed.event_id = p_event_id
  AND ed.is_active = true
  AND (
    array_length(ed.application_types, 1) IS NULL
    OR
    user_app_type = ANY(ed.application_types)
  )
  AND (ed.valid_until IS NULL OR ed.valid_until > now())
  
  UNION ALL
  
  -- Return global deals assigned to this event or all events
  SELECT 
    gd.id,
    gd.title,
    gd.description,
    gd.discount_type,
    gd.discount_value,
    gd.discount_code,
    gd.provider,
    gd.provider_logo_url,
    gd.created_at AS valid_from,
    NULL AS valid_until,
    true AS is_global
  FROM global_deals gd
  JOIN deal_assignments da ON da.global_deal_id = gd.id
  WHERE gd.is_active = true
  AND da.is_active = true
  AND (da.event_id = p_event_id OR da.event_id IS NULL)
  AND (
    array_length(da.application_types, 1) IS NULL
    OR
    user_app_type = ANY(da.application_types)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get all information for an attendee
CREATE OR REPLACE FUNCTION get_attendee_information(p_user_id UUID, p_event_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  user_app_type application_type;
BEGIN
  -- Get the user's application type for this event
  SELECT a.application_type INTO user_app_type
  FROM applications a
  WHERE a.user_id = p_user_id
  AND a.event_id = p_event_id
  AND a.status = 'approved';
  
  -- Return event information
  RETURN QUERY
  SELECT 
    ei.id,
    ei.title,
    ei.content,
    ei.created_at,
    ei.updated_at
  FROM event_information ei
  WHERE ei.event_id = p_event_id
  AND ei.is_active = true
  AND (
    array_length(ei.application_types, 1) IS NULL
    OR
    user_app_type = ANY(ei.application_types)
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample event information
INSERT INTO event_information (event_id, title, content, application_types, is_active)
SELECT 
  e.id,
  'Welcome to ' || e.name,
  'Thank you for being part of our event! This page contains important information about the event, including setup times, venue details, and other resources.',
  NULL,
  true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_information ei 
  WHERE ei.event_id = e.id
  AND ei.title = 'Welcome to ' || e.name
);

INSERT INTO event_information (event_id, title, content, application_types, is_active)
SELECT 
  e.id,
  'Artist Setup Information',
  'Artist setup begins at 8:00 AM on the first day of the event. Please bring your own equipment, including chairs, lamps, and supplies. Power will be provided at each booth.',
  ARRAY['artist']::application_type[],
  true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_information ei 
  WHERE ei.event_id = e.id
  AND ei.title = 'Artist Setup Information'
);

-- Insert sample event deals
INSERT INTO event_deals (
  event_id, 
  title, 
  description, 
  discount_type, 
  discount_value, 
  discount_code, 
  provider, 
  provider_logo_url, 
  application_types, 
  valid_from, 
  valid_until, 
  is_active
)
SELECT 
  e.id,
  'Exclusive Tattoo Supply Discount',
  '20% off all tattoo supplies from InkMasters Supply Co. Valid during the event weekend.',
  'percentage',
  20.00,
  'INKFEST20',
  'InkMasters Supply Co.',
  'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=200',
  ARRAY['artist']::application_type[],
  now(),
  now() + interval '3 months',
  true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_deals ed 
  WHERE ed.event_id = e.id
  AND ed.title = 'Exclusive Tattoo Supply Discount'
);

INSERT INTO event_deals (
  event_id, 
  title, 
  description, 
  discount_type, 
  discount_value, 
  discount_code, 
  provider, 
  provider_logo_url, 
  application_types, 
  valid_from, 
  valid_until, 
  is_active
)
SELECT 
  e.id,
  'Hotel Discount',
  'Special rate at the Riverside Hotel for all event attendees. Use code TATTCON24 when booking.',
  'fixed',
  50.00,
  'TATTCON24',
  'Riverside Hotel',
  'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=200',
  NULL, -- Available to all attendee types
  now(),
  now() + interval '3 months',
  true
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_deals ed 
  WHERE ed.event_id = e.id
  AND ed.title = 'Hotel Discount'
);

-- Insert sample global deals
INSERT INTO global_deals (
  title, 
  description, 
  discount_type, 
  discount_value, 
  discount_code, 
  provider, 
  provider_logo_url, 
  is_active
)
SELECT 
  'TattSync Pro Membership Discount',
  'Get 15% off your first year of TattSync Pro membership. Access exclusive events and resources.',
  'percentage',
  15.00,
  'TATTSYNCPRO15',
  'TattSync',
  'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=200',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM global_deals 
  WHERE title = 'TattSync Pro Membership Discount'
);

-- Assign global deals to all events
INSERT INTO deal_assignments (
  global_deal_id,
  event_id,
  application_types,
  is_active
)
SELECT 
  gd.id,
  NULL, -- All events
  NULL, -- All application types
  true
FROM global_deals gd
WHERE gd.title = 'TattSync Pro Membership Discount'
AND NOT EXISTS (
  SELECT 1 FROM deal_assignments 
  WHERE global_deal_id = gd.id
  AND event_id IS NULL
);