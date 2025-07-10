/*
  # Fix Ticket Dependencies and Add Control Functions

  1. New Functions
    - `disable_ticket_dependency_checks`: Temporarily disables dependency checks
    - `enable_ticket_dependency_checks`: Re-enables dependency checks
  
  2. Changes
    - Fixed `check_ticket_dependencies` function to handle both string and integer IDs
    - Improved `check_venue_capacity` function to handle NULL values properly
    - Added index on dependency_ticket_id for better performance
*/

-- Fix the check_ticket_dependencies function to properly handle string and integer IDs
CREATE OR REPLACE FUNCTION check_ticket_dependencies()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip check if no dependency
  IF NEW.dependency_ticket_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if the dependency ticket exists and is active
  -- Convert both IDs to text for comparison to handle both integer and string IDs
  IF NOT EXISTS (
    SELECT 1 FROM ticket_types 
    WHERE id::text = NEW.dependency_ticket_id::text 
    AND is_active = true
    AND event_id = NEW.event_id
  ) THEN
    RAISE EXCEPTION 'Dependency ticket does not exist or is not active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the check_venue_capacity function to properly handle NULL values
CREATE OR REPLACE FUNCTION check_venue_capacity()
RETURNS TRIGGER AS $$
DECLARE
  venue_capacity INTEGER;
  current_capacity INTEGER;
BEGIN
  -- Get venue capacity from the event
  SELECT max_attendees INTO venue_capacity
  FROM events
  WHERE id = NEW.event_id;
  
  -- Skip check if ticket doesn't affect capacity
  IF NOT NEW.affects_capacity THEN
    RETURN NEW;
  END IF;
  
  -- Calculate current capacity usage
  SELECT COALESCE(SUM(capacity), 0) INTO current_capacity
  FROM ticket_types
  WHERE event_id = NEW.event_id
    AND affects_capacity = true
    AND id != NEW.id;
  
  -- Add new ticket capacity
  IF NEW.capacity IS NOT NULL THEN
    current_capacity := current_capacity + NEW.capacity;
  END IF;
  
  -- Check if total capacity exceeds venue capacity
  IF venue_capacity IS NOT NULL AND current_capacity > venue_capacity THEN
    RAISE EXCEPTION 'Total ticket capacity (%) exceeds venue capacity (%)', 
                    current_capacity, venue_capacity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add an index on dependency_ticket_id to improve lookup performance
CREATE INDEX IF NOT EXISTS idx_ticket_types_dependency ON ticket_types(dependency_ticket_id);

-- Create a function to temporarily disable ticket dependency checks
CREATE OR REPLACE FUNCTION disable_ticket_dependency_checks()
RETURNS VOID AS $$
BEGIN
  ALTER TABLE ticket_types DISABLE TRIGGER trigger_check_ticket_dependencies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to re-enable ticket dependency checks
CREATE OR REPLACE FUNCTION enable_ticket_dependency_checks()
RETURNS VOID AS $$
BEGIN
  ALTER TABLE ticket_types ENABLE TRIGGER trigger_check_ticket_dependencies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;