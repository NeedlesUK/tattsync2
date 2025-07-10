/*
  # Add caterer to application_type enum
  
  1. New Types
    - Add 'caterer' to the application_type enum
  
  This migration adds the 'caterer' application type to the existing enum,
  allowing event managers to accept applications from caterers.
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