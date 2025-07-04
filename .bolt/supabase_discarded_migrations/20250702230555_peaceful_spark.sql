/*
# Ticketing Module Implementation

1. New Tables
   - `ticket_types` - Defines different ticket types for events
   - `ticket_discounts` - Stores discount codes for tickets
   - `tickets` - Records purchased tickets
   - `ticket_allocations` - Maps tickets to specific event days
   - `ticket_scans` - Tracks when tickets are scanned at events
   - `consent_preferences` - Stores marketing consent preferences

2. Security
   - Enable RLS on all new tables
   - Add policies for event managers, admins, and clients
   - Ensure clients can only access their own tickets
   - Allow event managers to manage tickets for their events

3. Functions
   - QR code generation for tickets
   - Automatic ticket allocation for multi-day events
*/

-- Create ticket_types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_gbp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  capacity INTEGER,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_discounts table
CREATE TABLE IF NOT EXISTS ticket_discounts (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, code)
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  price_gbp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  qr_code TEXT,
  UNIQUE(event_id, client_id, ticket_type)
);

-- Create ticket_allocations table
CREATE TABLE IF NOT EXISTS ticket_allocations (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_day DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_scans table
CREATE TABLE IF NOT EXISTS ticket_scans (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  scanned_by UUID REFERENCES users(id),
  event_day DATE NOT NULL,
  notes TEXT
);

-- Create consent_preferences table
CREATE TABLE IF NOT EXISTS consent_preferences (
  id SERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_marketing BOOLEAN DEFAULT false,
  platform_marketing BOOLEAN DEFAULT false,
  data_sharing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_discounts_event_id ON ticket_discounts(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_discounts_code ON ticket_discounts(code);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_ticket_allocations_ticket_id ON ticket_allocations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_scans_ticket_id ON ticket_scans(ticket_id);
CREATE INDEX IF NOT EXISTS idx_consent_preferences_client_id ON consent_preferences(client_id);

-- Enable RLS
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_preferences ENABLE ROW LEVEL SECURITY;

-- Function to check if policy exists
CREATE OR REPLACE FUNCTION policy_exists(policy_name text, table_name text) RETURNS boolean AS $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE policyname = policy_name AND tablename = table_name;
  
  RETURN policy_count > 0;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for ticket_types
DO $$ 
DECLARE
  policy_name text := 'Event managers can manage ticket types';
  table_name text := 'ticket_types';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR ALL
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = %s.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = ''admin''
          ))
        )', policy_name, table_name, table_name);
  END IF;
END $$;

DO $$ 
DECLARE
  policy_name text := 'Anyone can read published ticket types';
  table_name text := 'ticket_types';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM events e
            WHERE e.id = %s.event_id
            AND e.status = ''published''
            AND %s.is_active = true
          )
        )', policy_name, table_name, table_name, table_name);
  END IF;
END $$;

-- RLS Policies for ticket_discounts
DO $$ 
DECLARE
  policy_name text := 'Event managers can manage ticket discounts';
  table_name text := 'ticket_discounts';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR ALL
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = %s.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = ''admin''
          ))
        )', policy_name, table_name, table_name);
  END IF;
END $$;

-- RLS Policies for tickets
DO $$ 
DECLARE
  policy_name text := 'Clients can read own tickets';
  table_name text := 'tickets';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR SELECT
        TO authenticated
        USING (
          client_id = auth.uid()
        )', policy_name, table_name);
  END IF;
END $$;

DO $$ 
DECLARE
  policy_name text := 'Event managers can read tickets for their events';
  table_name text := 'tickets';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR SELECT
        TO authenticated
        USING (
          (auth.uid() IN (
            SELECT e.event_manager_id
            FROM events e
            WHERE e.id = %s.event_id
            AND e.event_manager_id IS NOT NULL
          ))
          OR
          (auth.uid() IN (
            SELECT u.id
            FROM users u
            WHERE u.role = ''admin''
          ))
        )', policy_name, table_name, table_name);
  END IF;
END $$;

-- RLS Policies for ticket_allocations
DO $$ 
DECLARE
  policy_name text := 'Clients can read own ticket allocations';
  table_name text := 'ticket_allocations';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM tickets t
            WHERE t.id = %s.ticket_id
            AND t.client_id = auth.uid()
          )
        )', policy_name, table_name, table_name);
  END IF;
END $$;

DO $$ 
DECLARE
  policy_name text := 'Event managers can manage ticket allocations';
  table_name text := 'ticket_allocations';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM tickets t
            JOIN events e ON e.id = t.event_id
            WHERE t.id = %s.ticket_id
            AND e.event_manager_id = auth.uid()
          )
        )', policy_name, table_name, table_name);
  END IF;
END $$;

-- RLS Policies for ticket_scans
DO $$ 
DECLARE
  policy_name text := 'Event managers can manage ticket scans';
  table_name text := 'ticket_scans';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM tickets t
            JOIN events e ON e.id = t.event_id
            WHERE t.id = %s.ticket_id
            AND e.event_manager_id = auth.uid()
          )
        )', policy_name, table_name, table_name);
  END IF;
END $$;

-- RLS Policies for consent_preferences
DO $$ 
DECLARE
  policy_name text := 'Clients can manage own consent preferences';
  table_name text := 'consent_preferences';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR ALL
        TO authenticated
        USING (
          client_id = auth.uid()
        )', policy_name, table_name);
  END IF;
END $$;

DO $$ 
DECLARE
  policy_name text := 'Event managers can read consent preferences';
  table_name text := 'consent_preferences';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = policy_name AND tablename = table_name) THEN
    EXECUTE format('
      CREATE POLICY "%s"
        ON %s
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM tickets t
            JOIN events e ON e.id = t.event_id
            WHERE t.client_id = %s.client_id
            AND e.event_manager_id = auth.uid()
          )
        )', policy_name, table_name, table_name);
  END IF;
END $$;

-- Function to generate QR code for tickets
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  -- In a real implementation, this would generate a unique QR code
  -- For now, we'll just create a placeholder
  NEW.qr_code = 'TICKET-' || NEW.event_id || '-' || NEW.client_id || '-' || NEW.ticket_type || '-' || FLOOR(RANDOM() * 1000000)::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_generate_ticket_qr_code ON tickets;

-- Trigger to generate QR code on ticket creation
CREATE TRIGGER trigger_generate_ticket_qr_code
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_qr_code();

-- Function to update ticket allocations
CREATE OR REPLACE FUNCTION update_ticket_allocations()
RETURNS TRIGGER AS $$
DECLARE
  event_start_date DATE;
  event_end_date DATE;
  curr_date DATE; -- Renamed from current_date to avoid reserved keyword conflict
BEGIN
  -- Get event dates
  SELECT start_date, end_date INTO event_start_date, event_end_date
  FROM events
  WHERE id = NEW.event_id;
  
  -- For each day of the event, create an allocation
  curr_date := event_start_date;
  WHILE curr_date <= event_end_date LOOP
    INSERT INTO ticket_allocations (ticket_id, event_day)
    VALUES (NEW.id, curr_date);
    
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_ticket_allocations ON tickets;

-- Trigger to create ticket allocations on ticket creation
CREATE TRIGGER trigger_update_ticket_allocations
AFTER INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_ticket_allocations();

-- Update event_modules table to include ticketing settings if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_modules' 
    AND column_name = 'ticketing_enabled'
  ) THEN
    -- Column doesn't exist, so we don't need to do anything
    -- It was already added in a previous migration
    NULL;
  END IF;
END $$;

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS policy_exists(text, text);