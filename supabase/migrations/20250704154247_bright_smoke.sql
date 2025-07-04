/*
  # Update User Role Enum Type

  1. Updates
    - Add new roles to the user_role enum type
    - Ensure all required roles are available for the system
    - Update existing admin user with all roles

  2. Changes
    - Adds event_manager, event_admin, client, studio_manager, judge roles
    - Ensures backward compatibility with existing roles
*/

-- Update the user_role enum type to include all required roles
DO $$
BEGIN
  -- Check if we need to add any missing user role types
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'event_manager' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    -- Add new roles to the enum
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'event_manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'event_admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'studio_manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'judge';
    
    RAISE NOTICE 'Added new roles to user_role enum type';
  ELSE
    RAISE NOTICE 'All required roles already exist in user_role enum type';
  END IF;
END $$;

-- Update the admin user to ensure they have the admin role
UPDATE public.users
SET role = 'admin'
WHERE email = 'gary@tattscore.com';

-- Update the admin user's metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'gary@tattscore.com';

-- Verify the enum type was updated correctly
DO $$
DECLARE
  role_count integer;
  expected_roles text[] := ARRAY['admin', 'artist', 'piercer', 'performer', 'trader', 'volunteer', 'event_manager', 'event_admin', 'client', 'studio_manager', 'judge'];
  missing_roles text[] := '{}';
  role_name text;
BEGIN
  -- Count how many roles exist
  SELECT COUNT(*) INTO role_count
  FROM pg_enum
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');
  
  -- Check for missing roles
  FOREACH role_name IN ARRAY expected_roles
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = role_name 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
      missing_roles := array_append(missing_roles, role_name);
    END IF;
  END LOOP;
  
  -- Output results
  RAISE NOTICE 'User role enum has % values', role_count;
  
  IF array_length(missing_roles, 1) IS NULL THEN
    RAISE NOTICE 'All required roles are present in the enum';
  ELSE
    RAISE WARNING 'Missing roles: %', missing_roles;
  END IF;
END
$$;