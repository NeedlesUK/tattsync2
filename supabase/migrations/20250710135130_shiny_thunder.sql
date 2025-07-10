/*
  # Fix ticket types table and dependencies

  1. Changes
     - Add proper validation for ticket dependencies
     - Ensure ticket types are properly saved to the database
     - Fix dependency_ticket_id handling to work with both integer and string IDs
     - Add proper error handling for ticket type operations

  2. Security
     - Maintain existing RLS policies
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

-- Fix the check_venue_capacity function to properly handle NULL arrays
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

-- Ensure the trigger exists for check_ticket_dependencies
DROP TRIGGER IF EXISTS trigger_check_ticket_dependencies ON ticket_types;
CREATE TRIGGER trigger_check_ticket_dependencies
BEFORE INSERT OR UPDATE ON ticket_types
FOR EACH ROW
EXECUTE FUNCTION check_ticket_dependencies();

-- Ensure the trigger exists for check_venue_capacity
DROP TRIGGER IF EXISTS trigger_check_venue_capacity ON ticket_types;
CREATE TRIGGER trigger_check_venue_capacity
BEFORE INSERT OR UPDATE ON ticket_types
FOR EACH ROW
EXECUTE FUNCTION check_venue_capacity();

-- Add an index on dependency_ticket_id to improve lookup performance
CREATE INDEX IF NOT EXISTS idx_ticket_types_dependency ON ticket_types(dependency_ticket_id);