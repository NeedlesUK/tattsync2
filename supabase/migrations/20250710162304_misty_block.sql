/*
  # Prevent Ticket Types Deletion
  
  1. Changes
     - Modify the foreign key constraint on ticket_types.event_id to use ON DELETE RESTRICT
     - This prevents automatic deletion of ticket types when an event is deleted
     - Ensures data integrity by requiring explicit handling of ticket types before deleting an event
  
  2. Security
     - No changes to RLS policies
*/

-- First, drop the existing foreign key constraint
ALTER TABLE ticket_types DROP CONSTRAINT IF EXISTS ticket_types_event_id_fkey;

-- Then recreate it with ON DELETE RESTRICT instead of CASCADE
ALTER TABLE ticket_types 
  ADD CONSTRAINT ticket_types_event_id_fkey 
  FOREIGN KEY (event_id) 
  REFERENCES events(id) 
  ON DELETE RESTRICT;

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT ticket_types_event_id_fkey ON ticket_types IS 
  'Prevents deletion of events that have associated ticket types. Ticket types must be explicitly deleted first.';

-- Create a function to safely delete events with associated ticket types
CREATE OR REPLACE FUNCTION safely_delete_event(event_id_param INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_tickets BOOLEAN;
BEGIN
  -- Check if the event has any ticket types
  SELECT EXISTS (
    SELECT 1 FROM ticket_types WHERE event_id = event_id_param
  ) INTO has_tickets;
  
  -- If it has tickets, return false (can't delete)
  IF has_tickets THEN
    RAISE EXCEPTION 'Cannot delete event with ID % because it has associated ticket types. Delete the ticket types first.', event_id_param;
    RETURN FALSE;
  END IF;
  
  -- If no tickets, delete the event
  DELETE FROM events WHERE id = event_id_param;
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION safely_delete_event(INTEGER) TO authenticated;