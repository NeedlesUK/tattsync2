/*
  # Add Profile Visibility Column and Function

  1. New Features
    - Add show_profile column to user_profiles table
    - Create function to check profile visibility in different contexts

  2. Security
    - Ensure profiles can be hidden from public view
    - Allow event managers, studio members, and clients with bookings to see profiles
    - Admins can always see all profiles
*/

-- Add show_profile column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_profile'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_profile BOOLEAN DEFAULT true;
    
    -- Update existing profiles to have show_profile = true
    UPDATE user_profiles SET show_profile = true;
    
    RAISE NOTICE 'Added show_profile column to user_profiles table';
  ELSE
    RAISE NOTICE 'show_profile column already exists in user_profiles table';
  END IF;
END $$;

-- Create function to override profile visibility in specific contexts
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
  IF is_visible OR profile_owner_id = viewer_id THEN
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

-- Verify the function was created
DO $$
DECLARE
  function_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'check_profile_visibility'
  ) INTO function_exists;
  
  IF function_exists THEN
    RAISE NOTICE 'check_profile_visibility function created successfully';
  ELSE
    RAISE WARNING 'Failed to create check_profile_visibility function';
  END IF;
END $$;