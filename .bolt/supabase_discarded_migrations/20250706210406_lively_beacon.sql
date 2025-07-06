/*
  # Add test users

  1. New Tables
    - No new tables created
    
  2. Changes
    - Add test users to auth.users and users tables
    - Create user profiles for test users
    - Add appropriate roles to user_roles table
    
  3. Security
    - No security changes
*/

-- Add test users if they don't exist
DO $$
DECLARE
  test_user_id uuid;
  manager_user_id uuid;
BEGIN
  -- Check if test@example.com exists
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com';
  
  -- If not exists, create it
  IF test_user_id IS NULL THEN
    -- Create test user in auth.users
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
      'test@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Test User","role":"artist"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO test_user_id;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (test_user_id, 'Test User', 'test@example.com', 'artist', now(), now());
    
    -- Add to user_roles table
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (test_user_id, 'artist', true);
    
    -- Add profile
    INSERT INTO user_profiles (
      user_id, 
      phone, 
      location, 
      bio, 
      experience, 
      specialties, 
      profile_picture
    )
    VALUES (
      test_user_id,
      '+44 7700 900123',
      'London, UK',
      'Experienced tattoo artist specializing in traditional styles.',
      '5 years',
      ARRAY['Traditional', 'Neo-Traditional', 'Black & Grey'],
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2'
    );
    
    RAISE NOTICE 'Created test user with ID %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists with ID %', test_user_id;
  END IF;
  
  -- Check if manager@example.com exists
  SELECT id INTO manager_user_id FROM auth.users WHERE email = 'manager@example.com';
  
  -- If not exists, create it
  IF manager_user_id IS NULL THEN
    -- Create manager user in auth.users
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
      'manager@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Event Manager","role":"event_manager"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO manager_user_id;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (manager_user_id, 'Event Manager', 'manager@example.com', 'event_manager', now(), now());
    
    -- Add to user_roles table
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (manager_user_id, 'event_manager', true);
    
    -- Add additional roles
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (manager_user_id, 'artist', false);
    
    -- Add profile
    INSERT INTO user_profiles (
      user_id, 
      phone, 
      location, 
      bio, 
      experience, 
      specialties, 
      profile_picture
    )
    VALUES (
      manager_user_id,
      '+44 7700 900456',
      'Manchester, UK',
      'Experienced event manager and tattoo artist.',
      '10 years',
      ARRAY['Event Management', 'Traditional Tattoo'],
      'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
    );
    
    RAISE NOTICE 'Created manager user with ID %', manager_user_id;
  ELSE
    RAISE NOTICE 'Manager user already exists with ID %', manager_user_id;
  END IF;
END
$$;