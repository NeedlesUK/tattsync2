/*
  # Add caterer to application_type enum

  1. Changes
     - Adds 'caterer' to the application_type enum if it doesn't already exist
*/

DO $$
BEGIN
  -- Check if 'caterer' already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'application_type'
    AND pg_enum.enumlabel = 'caterer'
  ) THEN
    -- Add 'caterer' to the enum
    ALTER TYPE application_type ADD VALUE 'caterer';
  END IF;
END
$$;