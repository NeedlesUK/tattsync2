/*
  # Fix Admin User Role
  
  1. Updates the user role in the public.users table
  2. Updates the user metadata in auth.users table
  3. Verifies the changes were applied correctly
*/

-- Update the user role in the users table
UPDATE public.users
SET 
  role = 'admin',
  name = 'Gary Watts'
WHERE email = 'gary@tattscore.com';

-- Update the user metadata in auth.users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'gary@tattscore.com';

-- Also ensure the name is properly set in metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{name}',
  '"Gary Watts"'
)
WHERE email = 'gary@tattscore.com';

-- Verify the user was updated correctly
DO $$
DECLARE
  user_is_admin boolean;
  user_id uuid;
  user_meta_role text;
  user_meta_name text;
BEGIN
  -- Check if user has admin role in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'gary@tattscore.com' AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Get user ID and metadata for logging
  SELECT id INTO user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  SELECT raw_user_meta_data->>'role' INTO user_meta_role FROM auth.users WHERE email = 'gary@tattscore.com';
  SELECT raw_user_meta_data->>'name' INTO user_meta_name FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- Output results
  IF user_is_admin THEN
    RAISE NOTICE 'User gary@tattscore.com (ID: %) updated to admin role successfully', user_id;
    RAISE NOTICE 'User metadata: name=%, role=%', user_meta_name, user_meta_role;
  ELSE
    RAISE WARNING 'Failed to update user gary@tattscore.com to admin role';
  END IF;
END
$$;