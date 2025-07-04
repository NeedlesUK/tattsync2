/*
  # Fix Event Manager Policies

  1. New Columns
    - Add `event_manager_id` column to `events` table if it doesn't exist
    - Create index on the column

  2. Security
    - Update RLS policies for events table
    - Check if policies exist before creating them
    - Ensure admin user has all roles
*/

-- Update event_manager_id column in events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_manager_id'
  ) THEN
    ALTER TABLE events ADD COLUMN event_manager_id UUID REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX idx_events_event_manager_id ON events(event_manager_id);
    
    RAISE NOTICE 'Added event_manager_id column to events table';
  ELSE
    RAISE NOTICE 'event_manager_id column already exists in events table';
  END IF;
END $$;

-- Update RLS policies for events table
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can read published events" ON events;
  DROP POLICY IF EXISTS "Admins can manage events" ON events;
  DROP POLICY IF EXISTS "Event managers can manage their events" ON events;
  
  -- Create new policies
  CREATE POLICY "Anyone can read published events"
    ON events
    FOR SELECT
    TO authenticated
    USING (
      status = 'published' OR 
      auth.uid() IN (SELECT id FROM users WHERE role = 'admin') OR
      event_manager_id = auth.uid()
    );
  
  CREATE POLICY "Admins can manage events"
    ON events
    FOR ALL
    TO authenticated
    USING (
      auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );
  
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND policyname = 'Event managers can manage their events'
  ) THEN
    CREATE POLICY "Event managers can manage their events"
      ON events
      FOR ALL
      TO authenticated
      USING (
        event_manager_id = auth.uid()
      );
    RAISE NOTICE 'Created Event managers can manage their events policy';
  ELSE
    RAISE NOTICE 'Event managers can manage their events policy already exists';
  END IF;
    
  RAISE NOTICE 'Updated RLS policies for events table';
END $$;

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
  
  -- Ensure admin role is set in users table
  UPDATE users
  SET role = 'admin'
  WHERE id = admin_id;
  
  RAISE NOTICE 'Added all roles to admin user';
END
$$;