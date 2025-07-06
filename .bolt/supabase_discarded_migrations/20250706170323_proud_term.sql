/*
  # Add Test Users

  1. New Users
    - Creates test users in auth.users if they don't exist
    - Adds corresponding entries in the users table
    - Sets up appropriate roles in user_roles table
    - Creates user profiles with sample data
    
  2. Test Accounts
    - Artist: test@example.com / password123
    - Manager: manager@example.com / password123
    - Admin: gary@tattscore.com / password123 (if not already exists)
*/

-- Add test users if they don't exist
DO $$
DECLARE
  test_user_id uuid;
  manager_user_id uuid;
  admin_user_id uuid;
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
  
  -- Check if admin user exists (gary@tattscore.com)
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'gary@tattscore.com';
  
  -- If not exists, create it
  IF admin_user_id IS NULL THEN
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
    RETURNING id INTO admin_user_id;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_user_id, 'Gary Watts', 'gary@tattscore.com', 'admin', now(), now());
    
    -- Add to user_roles table
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_user_id, 'admin', true);
    
    -- Add all roles for admin
    FOR role_type IN 
      SELECT unnest(enum_range(NULL::user_role))
    LOOP
      IF role_type <> 'admin' THEN
        INSERT INTO user_roles (user_id, role, is_primary)
        VALUES (admin_user_id, role_type, false)
        ON CONFLICT (user_id, role) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Add profile
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
      admin_user_id,
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
    );
    
    RAISE NOTICE 'Created admin user with ID %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID %', admin_user_id;
  END IF;
END
$$;