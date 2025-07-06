/*
  # Configure User Roles

  1. New Tables
    - No new tables created
  2. Security
    - No security changes
  3. Changes
    - Configures gary@tattscore.com as master admin with all roles
    - Configures gary@gwts.co.uk as event manager with only event_manager role
    - Removes any test users
*/

-- Remove test users if they exist
DO $$
DECLARE
  test_user_id uuid;
  manager_user_id uuid;
BEGIN
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
  SELECT id INTO manager_user_id FROM auth.users WHERE email = 'manager@example.com';
  IF manager_user_id IS NOT NULL THEN
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE user_id = manager_user_id;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id = manager_user_id;
    
    -- Delete from users
    DELETE FROM users WHERE id = manager_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = manager_user_id;
    
    RAISE NOTICE 'Removed test user manager@example.com';
  END IF;
END
$$;

-- Configure gary@tattscore.com as master admin with all roles
DO $$
DECLARE
  admin_id uuid;
  role_type user_role;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM users WHERE email = 'gary@tattscore.com';
  
  -- Skip if admin not found
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user gary@tattscore.com not found, skipping role assignment';
    RETURN;
  END IF;
  
  -- Update main role to admin
  UPDATE users
  SET role = 'admin'
  WHERE id = admin_id;
  
  -- Clear existing roles
  DELETE FROM user_roles WHERE user_id = admin_id;
  
  -- Add all roles for admin
  FOR role_type IN 
    SELECT unnest(enum_range(NULL::user_role))
  LOOP
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (admin_id, role_type, role_type = 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Configured gary@tattscore.com as master admin with all roles';
END
$$;

-- Configure gary@gwts.co.uk as event manager with only event_manager role
DO $$
DECLARE
  event_manager_id uuid;
BEGIN
  -- Get event manager user ID
  SELECT id INTO event_manager_id FROM users WHERE email = 'gary@gwts.co.uk';
  
  -- Skip if event manager not found
  IF event_manager_id IS NULL THEN
    RAISE NOTICE 'Event manager gary@gwts.co.uk not found, skipping role assignment';
    RETURN;
  END IF;
  
  -- Update main role to event_manager
  UPDATE users
  SET role = 'event_manager'
  WHERE id = event_manager_id;
  
  -- Clear existing roles
  DELETE FROM user_roles WHERE user_id = event_manager_id;
  
  -- Add only event_manager role
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (event_manager_id, 'event_manager', true)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Configured gary@gwts.co.uk as event manager with only event_manager role';
END
$$;