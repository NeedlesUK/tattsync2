/*
  # Add TattScore module to event_modules table

  1. Changes
    - Add `tattscore_enabled` column to event_modules table
    - Set default value to false
  
  2. Security
    - No changes to RLS policies needed as they already apply to the table
*/

-- Add tattscore_enabled column to event_modules if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_modules' AND column_name = 'tattscore_enabled'
  ) THEN
    ALTER TABLE event_modules ADD COLUMN tattscore_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;