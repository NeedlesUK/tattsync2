/*
  # Update user_profiles table with show_profile field
  
  1. Add show_profile field to user_profiles table
  2. Set default value to true
  3. Update existing profiles to have show_profile = true
*/

-- Add show_profile column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_profile'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_profile BOOLEAN DEFAULT true;
    
    -- Update existing profiles to have show_profile = true
    UPDATE user_profiles SET show_profile = true;
    
    RAISE NOTICE 'Added show_profile column to user_profiles table';
  ELSE
    RAISE NOTICE 'show_profile column already exists in user_profiles table';
  END IF;
END $$;

-- Verify the column was added
DO $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_profile'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'show_profile column exists in user_profiles table';
  ELSE
    RAISE WARNING 'show_profile column does not exist in user_profiles table';
  END IF;
END $$;