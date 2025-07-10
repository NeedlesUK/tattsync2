-- Add new columns to ticket_types table
DO $$ 
BEGIN
  -- Add affects_capacity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' AND column_name = 'affects_capacity'
  ) THEN
    ALTER TABLE ticket_types ADD COLUMN affects_capacity BOOLEAN DEFAULT true;
  END IF;

  -- Add applicable_days column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' AND column_name = 'applicable_days'
  ) THEN
    ALTER TABLE ticket_types ADD COLUMN applicable_days DATE[] DEFAULT ARRAY[]::DATE[];
  END IF;

  -- Add dependency_ticket_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' AND column_name = 'dependency_ticket_id'
  ) THEN
    ALTER TABLE ticket_types ADD COLUMN dependency_ticket_id INTEGER REFERENCES ticket_types(id) ON DELETE SET NULL;
  END IF;

  -- Add max_per_order column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' AND column_name = 'max_per_order'
  ) THEN
    ALTER TABLE ticket_types ADD COLUMN max_per_order INTEGER;
  END IF;

  -- Add min_age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' AND column_name = 'min_age'
  ) THEN
    ALTER TABLE ticket_types ADD COLUMN min_age INTEGER;
  END IF;
END
$$;

-- Create function to check ticket dependencies
CREATE OR REPLACE FUNCTION check_ticket_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  dependent_ticket RECORD;
  parent_ticket_id INTEGER;
  parent_ticket_count INTEGER;
BEGIN
  -- If this is a ticket purchase
  IF TG_TABLE_NAME = 'tickets' THEN
    -- Check if the ticket type has a dependency
    SELECT dependency_ticket_id INTO parent_ticket_id
    FROM ticket_types
    WHERE id = NEW.ticket_type_id;
    
    -- If there's a dependency, check if the parent ticket exists
    IF parent_ticket_id IS NOT NULL THEN
      -- Count how many parent tickets this client has for this event
      SELECT COUNT(*) INTO parent_ticket_count
      FROM tickets
      WHERE client_id = NEW.client_id
        AND event_id = NEW.event_id
        AND ticket_type_id = parent_ticket_id
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

-- Create trigger for ticket dependencies if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_check_ticket_dependencies'
  ) THEN
    CREATE TRIGGER trigger_check_ticket_dependencies
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION check_ticket_dependencies();
  END IF;
END $$;

-- Create function to check venue capacity
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
    IF array_length(ticket_applicable_days, 1) > 0 THEN
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
            array_length(tt.applicable_days, 1) = 0
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
            array_length(tt.applicable_days, 1) = 0
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

-- Create trigger for venue capacity if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_check_venue_capacity'
  ) THEN
    CREATE TRIGGER trigger_check_venue_capacity
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION check_venue_capacity();
  END IF;
END $$;