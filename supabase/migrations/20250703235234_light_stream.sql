/*
  # Create or Update Master Admin User
  
  1. Checks if user exists before creating
  2. Updates the user if it already exists
  3. Ensures proper role assignments
  4. Creates necessary relationships for TattScore and Studio access
*/

-- Create or update admin user
DO $$
DECLARE
  new_user_id uuid;
  user_exists boolean;
BEGIN
  -- Check if user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gary@tattscore.com'
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Get the existing user ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'gary@tattscore.com';
    
    -- Update the existing user metadata if needed
    UPDATE auth.users 
    SET 
      raw_user_meta_data = '{"name":"Gary Watts", "role":"admin"}',
      updated_at = now()
    WHERE id = new_user_id;
    
    RAISE NOTICE 'User already exists, updated metadata for user ID: %', new_user_id;
  ELSE
    -- Create the user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) 
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'gary@tattscore.com',
      crypt('TemporaryPassword123!', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Gary Watts", "role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;
    
    RAISE NOTICE 'Created new user with ID: %', new_user_id;
  END IF;
  
  -- Insert or update the user in public.users with admin role
  INSERT INTO public.users (id, name, email, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'Gary Watts',
    'gary@tattscore.com',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();
  
  -- Create a client record for the admin user (for testing client features)
  INSERT INTO public.clients (id, name, email, created_at)
  VALUES (
    new_user_id,
    'Gary Watts',
    'gary@tattscore.com',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = 'Gary Watts',
    updated_at = now();
  
  -- Ensure the user has judge role for TattScore
  INSERT INTO public.tattscore_judges (event_id, user_id, is_active, created_at)
  SELECT 
    id, 
    new_user_id, 
    true, 
    now()
  FROM public.events
  ON CONFLICT (event_id, user_id) DO NOTHING;
  
  -- Ensure the user has studio_manager role for any studios
  INSERT INTO public.studio_members (studio_id, user_id, role, is_active, created_at)
  SELECT 
    id, 
    new_user_id, 
    'studio_manager', 
    true, 
    now()
  FROM public.studios
  ON CONFLICT (studio_id, user_id) DO NOTHING;
  
  RAISE NOTICE 'Admin user setup complete with ID: %', new_user_id;
END
$$;

-- Verify the user was created or updated correctly
DO $$
DECLARE
  user_exists boolean;
  user_is_admin boolean;
  user_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gary@tattscore.com'
  ) INTO user_exists;
  
  -- Check if user has admin role in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'gary@tattscore.com' AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Get user ID for logging
  SELECT id INTO user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- Output results
  IF user_exists AND user_is_admin THEN
    RAISE NOTICE 'Master Admin user (ID: %) verified with full system access', user_id;
  ELSIF user_exists AND NOT user_is_admin THEN
    RAISE WARNING 'User exists but does not have admin role';
  ELSIF NOT user_exists THEN
    RAISE WARNING 'Failed to create or find user in auth.users';
  END IF;
END
$$;