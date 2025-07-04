/*
  # Fix Admin User Role
  
  1. Updates the user role for gary@tattscore.com to 'admin'
  2. Ensures the user metadata is correctly set
  3. Verifies the user has admin role in the users table
*/

-- Update the user role in the users table
UPDATE public.users
SET role = 'admin'
WHERE email = 'gary@tattscore.com';

-- Update the user metadata in auth.users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'gary@tattscore.com';

-- Verify the user was updated correctly
DO $$
DECLARE
  user_is_admin boolean;
  user_id uuid;
  user_meta_role text;
BEGIN
  -- Check if user has admin role in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'gary@tattscore.com' AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Get user ID and metadata role for logging
  SELECT id INTO user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  SELECT raw_user_meta_data->>'role' INTO user_meta_role FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- Output results
  IF user_is_admin THEN
    RAISE NOTICE 'User gary@tattscore.com (ID: %) updated to admin role successfully. Metadata role: %', user_id, user_meta_role;
  ELSE
    RAISE WARNING 'Failed to update user gary@tattscore.com to admin role';
  END IF;
END
$$;