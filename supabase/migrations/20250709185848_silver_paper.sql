/*
  # Fix infinite recursion in users table RLS policies
  
  1. Changes
     - Drops problematic policies that cause infinite recursion
     - Creates simplified policies without recursive references
     - Uses auth.uid() directly instead of table lookups
     - Uses JWT claims for admin checks
  
  2. Security
     - Maintains proper access control
     - Eliminates circular references in policy conditions
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Check if policies exist before creating them
DO $$
BEGIN
  -- Users can read own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Users can update own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Users can insert own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data" ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Admin policy using auth.jwt() to check claims instead of table lookup
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Admins can manage all users'
  ) THEN
    CREATE POLICY "Admins can manage all users" ON users
      FOR ALL
      TO authenticated
      USING (
        auth.jwt() ->> 'email' = 'admin@tattsync.com' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );
  END IF;
END
$$;