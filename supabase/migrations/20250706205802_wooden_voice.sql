/*
  # Add test users and ensure admin accounts exist

  1. New Tables
    - None (uses existing tables)
  
  2. Security
    - No changes to security policies
  
  3. Changes
    - Adds or updates admin accounts (gary@tattscore.com and gary@gwts.co.uk)
    - Adds test user accounts for development
    - Ensures all admin users have all roles assigned
*/

-- Add or update the existing accounts
DO $$
DECLARE
  admin_id_1 uuid;
  admin_id_2 uuid;
  role_type user_role;
BEGIN
  -- Check if gary@tattscore.com exists in auth.users
  SELECT id INTO admin_id_1 FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- If not exists, create it
  IF admin_id_1 IS NULL THEN
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
      'gary@tattscore.com',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Gary Watts","role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_id_1;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id_1, 'Gary Watts', 'gary@tattscore.com', 'admin', now(), now());
    
    RAISE NOTICE 'Created admin user gary@tattscore.com with ID %', admin_id_1;
  ELSE
    -- Update password for existing user
    UPDATE auth.users 
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_id_1;
    
    -- Ensure user exists in users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id_1, 'Gary Watts', 'gary@tattscore.com', 'admin', now(), now())
    ON CONFLICT (id) DO UPDATE 
    SET name = 'Gary Watts', 
        email = 'gary@tattscore.com', 
        role = 'admin', 
        updated_at = now();
    
    RAISE NOTICE 'Updated admin user gary@tattscore.com with ID %', admin_id_1;
  END IF;
  
  -- Check if gary@gwts.co.uk exists in auth.users
  SELECT id INTO admin_id_2 FROM auth.users WHERE email = 'gary@gwts.co.uk';
  
  -- If not exists, create it
  IF admin_id_2 IS NULL THEN
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
      'gary@gwts.co.uk',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Gary Watts","role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_id_2;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id_2, 'Gary Watts', 'gary@gwts.co.uk', 'admin', now(), now());
    
    RAISE NOTICE 'Created admin user gary@gwts.co.uk with ID %', admin_id_2;
  ELSE
    -- Update password for existing user
    UPDATE auth.users 
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_id_2;
    
    -- Ensure user exists in users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id_2, 'Gary Watts', 'gary@gwts.co.uk', 'admin', now(), now())
    ON CONFLICT (id) DO UPDATE 
    SET name = 'Gary Watts', 
        email = 'gary@gwts.co.uk', 
        role = 'admin', 
        updated_at = now();
    
    RAISE NOTICE 'Updated admin user gary@gwts.co.uk with ID %', admin_id_2;
  END IF;
  
  -- Add all roles for both admin users
  FOR role_type IN 
    SELECT unnest(enum_range(NULL::user_role))
  LOOP
    -- For gary@tattscore.com
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_id_1, role_type, role_type = 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- For gary@gwts.co.uk
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_id_2, role_type, role_type = 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  -- Create profiles for both admin users if they don't exist
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
  SELECT 
    admin_id_1,
    '+44 7700 900000',
    'London, UK',
    'TattSync Master Administrator',
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
  SELECT 
    admin_id_2,
    '+44 7700 900001',
    'London, UK',
    'TattSync Administrator',
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