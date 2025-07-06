/*
# Reset Admin Password

1. Updates the password for the admin@tattsync.com user
2. This migration provides a way to reset the password when needed
*/

-- Reset password for admin@tattsync.com to a new secure password
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Find the admin user
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tattsync.com';
  
  -- If admin exists, update the password
  IF admin_id IS NOT NULL THEN
    -- Update password to 'NewPassword123!'
    UPDATE auth.users 
    SET encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Password reset for admin@tattsync.com';
  ELSE
    RAISE NOTICE 'Admin user admin@tattsync.com not found';
  END IF;
END
$$;

-- Create admin@tattsync.com if it doesn't exist
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
    )
    RETURNING id INTO admin_id;
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id, 'System Administrator', 'admin@tattsync.com', 'admin', now(), now());
    
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
    );
    
    RAISE NOTICE 'Created admin user admin@tattsync.com with ID %', admin_id;
  END IF;
END
$$;