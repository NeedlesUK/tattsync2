-- Add show_profile column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_profile BOOLEAN DEFAULT true;

-- Update existing profiles to have show_profile = true
UPDATE user_profiles SET show_profile = true WHERE show_profile IS NULL;

-- Create function to check profile visibility in specific contexts
CREATE OR REPLACE FUNCTION check_profile_visibility(profile_owner_id UUID, viewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_visible BOOLEAN;
  is_event_manager BOOLEAN;
  is_studio_member BOOLEAN;
  has_booking BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  -- Check if profile is set to public
  SELECT show_profile INTO is_visible
  FROM user_profiles
  WHERE user_id = profile_owner_id;
  
  -- If profile is public or viewer is the owner, return true
  IF is_visible IS NULL OR is_visible OR profile_owner_id = viewer_id THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is admin
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = viewer_id AND role = 'admin'
  ) INTO is_admin;
  
  IF is_admin THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is event manager for an event where profile owner has applied
  SELECT EXISTS (
    SELECT 1 
    FROM events e
    JOIN applications a ON a.event_id = e.id
    WHERE a.user_id = profile_owner_id AND e.event_manager_id = viewer_id
  ) INTO is_event_manager;
  
  IF is_event_manager THEN
    RETURN true;
  END IF;
  
  -- Check if viewer is in same studio as profile owner
  SELECT EXISTS (
    SELECT 1
    FROM studio_members sm1
    JOIN studio_members sm2 ON sm1.studio_id = sm2.studio_id
    WHERE sm1.user_id = profile_owner_id AND sm2.user_id = viewer_id
  ) INTO is_studio_member;
  
  IF is_studio_member THEN
    RETURN true;
  END IF;
  
  -- Check if viewer has a booking with profile owner
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE (b.artist_id = profile_owner_id AND b.client_id = viewer_id)
       OR (b.artist_id = viewer_id AND b.client_id = profile_owner_id)
  ) INTO has_booking;
  
  IF has_booking THEN
    RETURN true;
  END IF;
  
  -- If none of the above conditions are met, return false
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user_roles junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles"
      ON user_roles
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE role = 'admin'
        )
      );
  END IF;
END $$;

-- Migrate existing roles to the junction table
INSERT INTO user_roles (user_id, role, is_primary)
SELECT id, role, true
FROM users
ON CONFLICT (user_id, role) DO NOTHING;

-- Create function to get all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (role user_role, is_primary BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role, ur.is_primary
  FROM user_roles ur
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set primary role
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

-- Create function to add a role to a user
CREATE OR REPLACE FUNCTION add_user_role(user_uuid UUID, new_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (user_uuid, new_role, false)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove a role from a user
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

-- Ensure the admin user has all roles
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
    ON CONFLICT (user_id, role) DO UPDATE SET
      is_primary = (role_type = 'admin');
  END LOOP;
  
  RAISE NOTICE 'Added all roles to admin user';
END
$$;