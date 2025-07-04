/*
  # Fix Admin User Role
  
  1. Updates the user role for gary@tattscore.com to 'admin'
  2. Ensures the user metadata is correctly set
  3. Verifies the user has admin role in the users table
  4. Adds additional logging for verification
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
  user_exists boolean;
  user_is_admin boolean;
  user_id uuid;
  user_meta_role text;
  user_meta_name text;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gary@tattscore.com'
  ) INTO user_exists;
  
  -- Check if user has admin role in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'gary@tattscore.com' AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Get user ID and metadata for logging
  SELECT id INTO user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  SELECT raw_user_meta_data->>'role' INTO user_meta_role FROM auth.users WHERE email = 'gary@tattscore.com';
  SELECT raw_user_meta_data->>'name' INTO user_meta_name FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- Output results
  RAISE NOTICE 'User gary@tattscore.com exists: %', user_exists;
  RAISE NOTICE 'User has admin role: %', user_is_admin;
  RAISE NOTICE 'User ID: %', user_id;
  RAISE NOTICE 'User metadata role: %', user_meta_role;
  RAISE NOTICE 'User metadata name: %', user_meta_name;
  
  -- Force update if not admin
  IF NOT user_is_admin AND user_exists THEN
    RAISE NOTICE 'Forcing admin role update for user';
    UPDATE public.users SET role = 'admin' WHERE email = 'gary@tattscore.com';
    UPDATE auth.users SET raw_user_meta_data = '{"role":"admin","name":"Gary Watts"}' WHERE email = 'gary@tattscore.com';
  END IF;
END
$$;