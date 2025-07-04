/*
  # Create Master Admin User
  
  1. Creates a new user in auth.users
  2. Inserts the user into public.users with admin role
  3. Grants necessary permissions for all TattSync and TattScore modules
  4. Ensures the user has access to all event management features
*/

-- First, create the user in auth.users using Supabase's admin functions
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
  
  -- Insert the user into public.users with admin role
  INSERT INTO public.users (id, name, email, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'Gary Watts',
    'gary@tattscore.com',
    'admin',
    now(),
    now()
  );
  
  -- Create a client record for the admin user (for testing client features)
  INSERT INTO public.clients (id, name, email, created_at)
  VALUES (
    new_user_id,
    'Gary Watts',
    'gary@tattscore.com',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Ensure the user has access to all existing events
  -- This is handled by RLS policies for admin role
  
  -- Ensure the user has judge role for TattScore
  INSERT INTO public.tattscore_judges (event_id, user_id, is_active, created_at)
  SELECT 
    id, 
    new_user_id, 
    true, 
    now()
  FROM public.events
  ON CONFLICT DO NOTHING;
  
  -- Ensure the user has studio_manager role for any studios
  INSERT INTO public.studio_members (studio_id, user_id, role, is_active, created_at)
  SELECT 
    id, 
    new_user_id, 
    'studio_manager', 
    true, 
    now()
  FROM public.studios
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Created admin user with ID: %', new_user_id;
END
$$;

-- Verify the user was created correctly
DO $$
DECLARE
  user_exists boolean;
  user_is_admin boolean;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gary@tattscore.com'
  ) INTO user_exists;
  
  -- Check if user has admin role in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'gary@tattscore.com' AND role = 'admin'
  ) INTO user_is_admin;
  
  -- Output results
  IF user_exists AND user_is_admin THEN
    RAISE NOTICE 'Master Admin user created successfully with full system access';
  ELSIF user_exists AND NOT user_is_admin THEN
    RAISE WARNING 'User exists but does not have admin role';
  ELSIF NOT user_exists THEN
    RAISE WARNING 'Failed to create user in auth.users';
  END IF;
END
$$;