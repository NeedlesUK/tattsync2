/*
  # Fix ticket dependency validation

  1. Changes
     - Drops and recreates the `check_ticket_dependencies` function with proper string comparison
     - Fixes the `check_venue_capacity` function to handle NULL arrays correctly
     - Adds proper triggers for both functions

  This migration addresses issues with ticket dependency validation where string/integer 
  comparison was causing validation failures. It also improves NULL handling in the venue
  capacity check function.
*/

-- Drop the existing functions and triggers
DROP TRIGGER IF EXISTS trigger_check_ticket_dependencies ON tickets;
DROP FUNCTION IF EXISTS check_ticket_dependencies();
DROP TRIGGER IF EXISTS trigger_check_venue_capacity ON tickets;
DROP FUNCTION IF EXISTS check_venue_capacity();

-- Create improved function to check ticket dependencies with proper string comparison
CREATE OR REPLACE FUNCTION check_ticket_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  dependent_ticket RECORD;
  parent_ticket_id TEXT;
  parent_ticket_count INTEGER;
BEGIN
  -- If this is a ticket purchase
  IF TG_TABLE_NAME = 'tickets' THEN
    -- Check if the ticket type has a dependency
    SELECT dependency_ticket_id::TEXT INTO parent_ticket_id
    FROM ticket_types
    WHERE id = NEW.ticket_type_id;
    
    -- If there's a dependency, check if the parent ticket exists
    IF parent_ticket_id IS NOT NULL THEN
      -- Count how many parent tickets this client has for this event
      SELECT COUNT(*) INTO parent_ticket_count
      FROM tickets
      WHERE client_id = NEW.client_id
        AND event_id = NEW.event_id
        AND ticket_type_id::TEXT = parent_ticket_id
        AND status = 'active';
        
      -- If no parent tickets, prevent purchase
      IF parent_ticket_count = 0 THEN
        RAISE EXCEPTION 'This ticket requires another ticket type to be purchased first';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket dependencies
CREATE TRIGGER trigger_check_ticket_dependencies
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION check_ticket_dependencies();

-- Create improved function to check venue capacity with proper NULL handling
CREATE OR REPLACE FUNCTION check_venue_capacity()
RETURNS TRIGGER AS $$
DECLARE
  venue_capacity INTEGER;
  current_capacity INTEGER;
  ticket_affects_capacity BOOLEAN;
  ticket_applicable_days DATE[];
  event_dates DATE[];
  day_date DATE;
  day_capacity INTEGER;
  day_tickets INTEGER;
BEGIN
  -- Get venue capacity
  SELECT max_attendees INTO venue_capacity
  FROM events
  WHERE id = NEW.event_id;
  
  -- Get ticket type info
  SELECT affects_capacity, applicable_days INTO ticket_affects_capacity, ticket_applicable_days
  FROM ticket_types
  WHERE id = NEW.ticket_type_id;
  
  -- If ticket affects capacity
  IF ticket_affects_capacity THEN
    -- Get event dates
    SELECT ARRAY(
      SELECT generate_series(start_date::date, end_date::date, '1 day'::interval)::date
      FROM events
      WHERE id = NEW.event_id
    ) INTO event_dates;
    
    -- If ticket applies to specific days
    IF ticket_applicable_days IS NOT NULL AND array_length(ticket_applicable_days, 1) > 0 THEN
      -- Check capacity for each applicable day
      FOREACH day_date IN ARRAY ticket_applicable_days
      LOOP
        -- Count tickets for this day
        SELECT COUNT(*) INTO day_tickets
        FROM tickets t
        JOIN ticket_types tt ON t.ticket_type_id = tt.id
        WHERE t.event_id = NEW.event_id
          AND t.status = 'active'
          AND tt.affects_capacity = true
          AND (
            -- Either the ticket applies to all days
            tt.applicable_days IS NULL OR array_length(tt.applicable_days, 1) = 0
            -- Or it specifically applies to this day
            OR day_date = ANY(tt.applicable_days)
          );
          
        -- Check if adding this ticket would exceed capacity
        IF day_tickets + 1 > venue_capacity THEN
          RAISE EXCEPTION 'Venue capacity exceeded for %', day_date;
        END IF;
      END LOOP;
    ELSE
      -- Ticket applies to all days, check capacity for each event day
      FOREACH day_date IN ARRAY event_dates
      LOOP
        -- Count tickets for this day
        SELECT COUNT(*) INTO day_tickets
        FROM tickets t
        JOIN ticket_types tt ON t.ticket_type_id = tt.id
        WHERE t.event_id = NEW.event_id
          AND t.status = 'active'
          AND tt.affects_capacity = true
          AND (
            -- Either the ticket applies to all days
            tt.applicable_days IS NULL OR array_length(tt.applicable_days, 1) = 0
            -- Or it specifically applies to this day
            OR day_date = ANY(tt.applicable_days)
          );
          
        -- Check if adding this ticket would exceed capacity
        IF day_tickets + 1 > venue_capacity THEN
          RAISE EXCEPTION 'Venue capacity exceeded for %', day_date;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for venue capacity
CREATE TRIGGER trigger_check_venue_capacity
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION check_venue_capacity();