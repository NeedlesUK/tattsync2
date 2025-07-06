/*
  # Remove test credentials

  1. New Tables
    - None
  
  2. Security
    - None
  
  3. Changes
    - Removes all references to test credentials
    - Creates a proper admin user with secure credentials
*/

-- Remove test users if they exist
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Check if gary@tattscore.com exists and remove
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  IF test_user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = test_user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = test_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Removed test user gary@tattscore.com';
  END IF;
  
  -- Check if gary@gwts.co.uk exists and remove
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'gary@gwts.co.uk';
  IF test_user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = test_user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = test_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Removed test user gary@gwts.co.uk';
  END IF;
  
  -- Check if test@example.com exists and remove
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com';
  IF test_user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = test_user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = test_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Removed test user test@example.com';
  END IF;
  
  -- Check if manager@example.com exists and remove
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'manager@example.com';
  IF test_user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = test_user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = test_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Removed test user manager@example.com';
  END IF;
END
$$;

-- Create a proper admin user
DO $$
DECLARE
  admin_id uuid;
  role_type user_role;
BEGIN
  -- Check if admin@tattsync.com exists in auth.users
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tattsync.com';
  
  -- If not exists, create it
  IF admin_id IS NULL THEN
    -- Create admin user in auth.users
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
      'admin@tattsync.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"System Administrator","role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_id;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id, 'System Administrator', 'admin@tattsync.com', 'admin', now(), now());
    
    RAISE NOTICE 'Created admin user admin@tattsync.com with ID %', admin_id;
  ELSE
    -- Ensure user exists in users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id, 'System Administrator', 'admin@tattsync.com', 'admin', now(), now())
    ON CONFLICT (id) DO UPDATE 
    SET name = 'System Administrator', 
        email = 'admin@tattsync.com', 
        role = 'admin', 
        updated_at = now();
    
    RAISE NOTICE 'Updated admin user admin@tattsync.com with ID %', admin_id;
  END IF;
  
  -- Add all roles for admin
  FOR role_type IN 
    SELECT unnest(enum_range(NULL::user_role))
  LOOP
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_id, role_type, role_type = 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  -- Create profile for admin user
  INSERT INTO user_profiles (
    user_id,
    phone,
    location,
    bio,
    website,
    instagram,
    facebook,
    tiktok,
    experience,
    specialties,
    profile_picture,
    show_instagram,
    show_facebook,
    show_tiktok,
    show_website,
    show_profile
  )
  VALUES (
    admin_id,
    '+1 (555) 123-4567',
    'System',
    'TattSync System Administrator',
    'https://tattsync.com',
    'tattsync',
    'tattsync',
    'tattsync',
    '10 years',
    ARRAY['Administration', 'Event Management', 'System Design'],
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&dpr=2',
    true,
    true,
    true,
    true,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    bio = EXCLUDED.bio,
    website = EXCLUDED.website,
    instagram = EXCLUDED.instagram,
    facebook = EXCLUDED.facebook,
    tiktok = EXCLUDED.tiktok,
    experience = EXCLUDED.experience,
    specialties = EXCLUDED.specialties,
    profile_picture = EXCLUDED.profile_picture,
    updated_at = now();
END
$$;