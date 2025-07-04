/*
  # Create Event Manager for The Great Western Tattoo Show
  
  1. New Tables
    - Creates a user account for Gary Watts as event manager
    - Links the user to the GWTS event
    - Ensures proper role assignment

  2. Security
    - Ensures the user has event_manager role
    - Updates the event record with the manager ID
*/

-- Create user account for Gary Watts if it doesn't exist
DO $$
DECLARE
  new_user_id uuid;
  event_id integer;
  user_exists boolean;
BEGIN
  -- Check if user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gary@gwts.co.uk'
  ) INTO user_exists;
  
  -- Get the event ID for The Great Western Tattoo Show
  SELECT id INTO event_id FROM events WHERE name = 'The Great Western Tattoo Show';
  
  IF NOT event_id IS NULL THEN
    RAISE NOTICE 'Found event ID: %', event_id;
  ELSE
    RAISE WARNING 'Event "The Great Western Tattoo Show" not found';
    RETURN;
  END IF;
  
  IF user_exists THEN
    -- Get the existing user ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'gary@gwts.co.uk';
    
    -- Update the existing user metadata if needed
    UPDATE auth.users 
    SET 
      raw_user_meta_data = '{"name":"Gary Watts", "role":"event_manager"}',
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
      'gary@gwts.co.uk',
      crypt('GWTSPassword123!', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Gary Watts", "role":"event_manager"}',
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
  
  -- Insert or update the user in public.users with event_manager role
  INSERT INTO public.users (id, name, email, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'Gary Watts',
    'gary@gwts.co.uk',
    'event_manager',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'event_manager',
    updated_at = now();
  
  -- Add event_manager role to user_roles
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (new_user_id, 'event_manager', true)
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_primary = true;
  
  -- Update the event with the event manager
  UPDATE events
  SET 
    event_manager_id = new_user_id,
    updated_at = now()
  WHERE id = event_id;
  
  RAISE NOTICE 'Updated event % with event manager ID: %', event_id, new_user_id;
END
$$;

-- Verify the user was created and assigned correctly
DO $$
DECLARE
  user_id uuid;
  event_id integer;
  event_name text;
  user_role text;
BEGIN
  -- Get user ID
  SELECT id INTO user_id FROM users WHERE email = 'gary@gwts.co.uk';
  
  -- Get event details
  SELECT e.id, e.name INTO event_id, event_name
  FROM events e
  WHERE e.event_manager_id = user_id;
  
  -- Get user role
  SELECT role INTO user_role FROM users WHERE id = user_id;
  
  -- Output results
  IF user_id IS NOT NULL THEN
    RAISE NOTICE 'User gary@gwts.co.uk exists with ID: %', user_id;
    RAISE NOTICE 'User role: %', user_role;
    
    IF event_id IS NOT NULL THEN
      RAISE NOTICE 'User is assigned as event manager for event: % (ID: %)', event_name, event_id;
    ELSE
      RAISE WARNING 'User is not assigned as event manager for any event';
    END IF;
  ELSE
    RAISE WARNING 'User gary@gwts.co.uk not found';
  END IF;
END
$$;