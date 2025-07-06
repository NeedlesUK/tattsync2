/*
  # User Roles and Profiles

  1. New Tables
    - `user_roles` - Junction table for users and roles
    - `user_profiles` - Extended user profile information
  
  2. Functions
    - Added functions to manage user roles
    - Added functions to set primary role
  
  3. Security
    - Added RLS policies for user roles and profiles
*/

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  location TEXT,
  bio TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  experience TEXT,
  specialties TEXT[],
  profile_picture TEXT,
  show_instagram BOOLEAN DEFAULT true,
  show_facebook BOOLEAN DEFAULT true,
  show_tiktok BOOLEAN DEFAULT true,
  show_website BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  show_profile BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
DO $$
BEGIN
  -- Drop existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
  DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
END
$$;

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- RLS Policies for user_profiles
DO $$
BEGIN
  -- Drop existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS "Users can manage their own profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
END
$$;

CREATE POLICY "Users can manage their own profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Migrate existing roles to the junction table
INSERT INTO user_roles (user_id, role, is_primary)
SELECT id, role, true
FROM users
ON CONFLICT (user_id, role) DO NOTHING;

-- Function to get all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (role user_role, is_primary BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role, ur.is_primary
  FROM user_roles ur
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set primary role
CREATE OR REPLACE FUNCTION set_primary_role(user_uuid UUID, primary_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
  role_exists BOOLEAN;
BEGIN
  -- Check if user has this role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = primary_role
  ) INTO role_exists;
  
  -- If role doesn't exist, add it
  IF NOT role_exists THEN
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (user_uuid, primary_role, true);
  END IF;
  
  -- Reset all roles to non-primary
  UPDATE user_roles
  SET is_primary = false
  WHERE user_id = user_uuid;
  
  -- Set the specified role as primary
  UPDATE user_roles
  SET is_primary = true
  WHERE user_id = user_uuid AND role = primary_role;
  
  -- Update the main role in users table
  UPDATE users
  SET role = primary_role
  WHERE id = user_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a role to a user
CREATE OR REPLACE FUNCTION add_user_role(user_uuid UUID, new_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (user_uuid, new_role, false)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a role from a user
CREATE OR REPLACE FUNCTION remove_user_role(user_uuid UUID, role_to_remove user_role)
RETURNS BOOLEAN AS $$
DECLARE
  is_primary BOOLEAN;
  role_count INTEGER;
BEGIN
  -- Check if this is the primary role
  SELECT ur.is_primary INTO is_primary
  FROM user_roles ur
  WHERE ur.user_id = user_uuid AND ur.role = role_to_remove;
  
  -- Count how many roles the user has
  SELECT COUNT(*) INTO role_count
  FROM user_roles
  WHERE user_id = user_uuid;
  
  -- Don't allow removing the only role
  IF role_count <= 1 THEN
    RETURN false;
  END IF;
  
  -- Don't allow removing primary role
  IF is_primary THEN
    RETURN false;
  END IF;
  
  -- Remove the role
  DELETE FROM user_roles
  WHERE user_id = user_uuid AND role = role_to_remove;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add all roles to admin user
DO $$
DECLARE
  admin_id uuid;
  role_type user_role;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM users WHERE email = 'gary@tattscore.com';
  
  -- Skip if admin not found
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found, skipping role assignment';
    RETURN;
  END IF;
  
  -- Add all roles for admin
  FOR role_type IN 
    SELECT unnest(enum_range(NULL::user_role))
  LOOP
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_id, role_type, role_type = 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Added all roles to admin user';
END
$$;

-- Create a profile for the admin user
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
  id,
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
FROM users
WHERE email = 'gary@tattscore.com'
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