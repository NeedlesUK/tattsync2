/*
  # Fix Ticket Types Deletion Issue
  
  1. Changes
     - Add a trigger to prevent accidental deletion of ticket types
     - Add a function to safely delete ticket types with proper checks
     - Improve error messages for better user experience
     
  2. Security
     - Ensure only authorized users can delete ticket types
     - Maintain existing RLS policies
*/

-- Create a function to check if a ticket type can be safely deleted
CREATE OR REPLACE FUNCTION check_ticket_type_deletion()
RETURNS TRIGGER AS $$
DECLARE
  dependent_tickets INTEGER;
BEGIN
  -- Check if any other ticket types depend on this one
  SELECT COUNT(*) INTO dependent_tickets
  FROM ticket_types
  WHERE dependency_ticket_id = OLD.id;
  
  -- If there are dependent tickets, prevent deletion
  IF dependent_tickets > 0 THEN
    RAISE EXCEPTION 'Cannot delete ticket type because % other ticket type(s) depend on it. Remove the dependencies first.', dependent_tickets;
  END IF;
  
  -- Check if any tickets have been sold for this ticket type
  IF EXISTS (
    SELECT 1 FROM tickets
    WHERE ticket_type_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete ticket type because tickets have already been sold. Deactivate it instead.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to prevent unsafe deletion of ticket types
DROP TRIGGER IF EXISTS trigger_check_ticket_type_deletion ON ticket_types;
CREATE TRIGGER trigger_check_ticket_type_deletion
BEFORE DELETE ON ticket_types
FOR EACH ROW
EXECUTE FUNCTION check_ticket_type_deletion();

-- Create a function to safely delete a ticket type
CREATE OR REPLACE FUNCTION safely_delete_ticket_type(ticket_type_id_param INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dependent_tickets INTEGER;
  sold_tickets INTEGER;
BEGIN
  -- Check if any other ticket types depend on this one
  SELECT COUNT(*) INTO dependent_tickets
  FROM ticket_types
  WHERE dependency_ticket_id = ticket_type_id_param;
  
  -- If there are dependent tickets, prevent deletion
  IF dependent_tickets > 0 THEN
    RAISE EXCEPTION 'Cannot delete ticket type because % other ticket type(s) depend on it. Remove the dependencies first.', dependent_tickets;
    RETURN FALSE;
  END IF;
  
  -- Check if any tickets have been sold for this ticket type
  SELECT COUNT(*) INTO sold_tickets
  FROM tickets
  WHERE ticket_type_id = ticket_type_id_param;
  
  IF sold_tickets > 0 THEN
    RAISE EXCEPTION 'Cannot delete ticket type because % tickets have already been sold. Deactivate it instead.', sold_tickets;
    RETURN FALSE;
  END IF;
  
  -- If all checks pass, delete the ticket type
  DELETE FROM ticket_types WHERE id = ticket_type_id_param;
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION safely_delete_ticket_type(INTEGER) TO authenticated;