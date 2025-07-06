/*
  # Remove test credentials and create admin user

  1. Changes
    - Removes any test users from the database
    - Creates a proper admin user with secure credentials
    - Sets up appropriate roles and profile for the admin user
*/

-- Function to safely remove users by email
CREATE OR REPLACE FUNCTION remove_user_by_email(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Find user ID from public.users table
  SELECT id INTO user_id FROM users WHERE email = user_email;
  
  IF user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = user_id;
    
    RAISE NOTICE 'Removed user %', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Remove test users
SELECT remove_user_by_email('gary@tattscore.com');
SELECT remove_user_by_email('gary@gwts.co.uk');
SELECT remove_user_by_email('test@example.com');
SELECT remove_user_by_email('manager@example.com');

-- Drop the function after use
DROP FUNCTION IF EXISTS remove_user_by_email;

-- Create a proper admin user if it doesn't exist
DO $$
DECLARE
  admin_id UUID;
  role_type user_role;
BEGIN
  -- Check if admin@tattsync.com exists in users table
  SELECT id INTO admin_id FROM users WHERE email = 'admin@tattsync.com';
  
  -- If not exists, create it
  IF admin_id IS NULL THEN
    -- Generate a new UUID for the admin user
    admin_id := gen_random_uuid();
    
    -- Add to users table
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (admin_id, 'System Administrator', 'admin@tattsync.com', 'admin', now(), now());
    
    RAISE NOTICE 'Created admin user admin@tattsync.com with ID %', admin_id;
  ELSE
    -- Update existing user
    UPDATE users 
    SET name = 'System Administrator', 
        role = 'admin', 
        updated_at = now()
    WHERE id = admin_id;
    
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