/*
  # Update max_attendees column description
  
  1. Changes
     - Updates the description of the max_attendees column in the events table
     - Clarifies that this field represents the maximum number of ticket holders per day
     - Ensures the check_venue_capacity function uses this value correctly
*/

-- Update the description of the max_attendees column
COMMENT ON COLUMN events.max_attendees IS 'Maximum number of ticket holders allowed per day';

-- Update the check_venue_capacity function to clarify it's checking per-day capacity
CREATE OR REPLACE FUNCTION check_venue_capacity()
RETURNS TRIGGER AS $$
DECLARE
  venue_capacity INTEGER;
  current_capacity INTEGER;
BEGIN
  -- Get venue capacity (max ticket holders per day) from the event
  SELECT max_attendees INTO venue_capacity
  FROM events
  WHERE id = NEW.event_id;
  
  -- Skip check if ticket doesn't affect capacity
  IF NOT NEW.affects_capacity THEN
    RETURN NEW;
  END IF;
  
  -- Calculate current capacity usage for tickets that affect capacity
  SELECT COALESCE(SUM(capacity), 0) INTO current_capacity
  FROM ticket_types
  WHERE event_id = NEW.event_id
    AND affects_capacity = true
    AND id != NEW.id;
  
  -- Add new ticket capacity
  IF NEW.capacity IS NOT NULL THEN
    current_capacity := current_capacity + NEW.capacity;
  END IF;
  
  -- Check if total capacity exceeds venue capacity (per day)
  IF venue_capacity IS NOT NULL AND current_capacity > venue_capacity THEN
    RAISE EXCEPTION 'Total ticket capacity (%) exceeds maximum daily capacity (%)', 
                    current_capacity, venue_capacity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS trigger_check_venue_capacity ON ticket_types;
CREATE TRIGGER trigger_check_venue_capacity
BEFORE INSERT OR UPDATE ON ticket_types
FOR EACH ROW
EXECUTE FUNCTION check_venue_capacity();