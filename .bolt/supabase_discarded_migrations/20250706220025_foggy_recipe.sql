/*
  # Admin User Setup

  1. New Tables
    - No new tables created
  2. Security
    - No security changes
  3. Changes
    - Creates a default admin user (admin@tattsync.com) with password 'NewPassword123!'
    - Ensures the admin user has all available roles
    - Creates a profile for the admin user
*/

-- Create a proper admin user if it doesn't exist
DO $$
DECLARE
  admin_id uuid;
  admin_exists boolean;
  role_type user_role;
BEGIN
  -- Check if admin@tattsync.com exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@tattsync.com'
  ) INTO admin_exists;
  
  -- If not exists, create it
  IF NOT admin_exists THEN
    -- Generate a new UUID for the admin user
    admin_id := gen_random_uuid();
    
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
      admin_id,
      'authenticated',
      'authenticated',
      'admin@tattsync.com',
      crypt('NewPassword123!', gen_salt('bf')),
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
    );
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id, 'System Administrator', 'admin@tattsync.com', 'admin', now(), now());
    
    RAISE NOTICE 'Created admin user admin@tattsync.com with ID %', admin_id;
  ELSE
    -- Get the existing admin ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tattsync.com';
    
    -- Update password for existing user
    UPDATE auth.users 
    SET encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_id;
    
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