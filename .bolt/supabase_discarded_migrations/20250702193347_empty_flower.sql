/*
  # Add event_admin role and waiting_list status

  1. New Enum Values
    - Add `event_admin` to user_role enum
    - Add `waiting_list` to application_status enum

  2. Security
    - Maintain existing RLS policies
    - No changes to table structure needed
*/

-- Add event_admin to user_role enum
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'event_admin';
EXCEPTION
    WHEN invalid_text_representation THEN null;
END $$;

-- Add waiting_list to application_status enum
DO $$ BEGIN
    ALTER TYPE application_status ADD VALUE 'waiting_list';
EXCEPTION
    WHEN invalid_text_representation THEN null;
END $$;