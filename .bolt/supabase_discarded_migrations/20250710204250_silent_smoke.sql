/*
  # Fix Users Table RLS Policies

  1. Security
    - Enable RLS on users table
    - Add policies for authenticated users to read user data
    - Add policy for admins to manage all users
    - Add policy for users to manage their own data
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Allow authenticated users to read user data (needed for studio queries)
CREATE POLICY "Authenticated users can read user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to manage their own data
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);

-- Allow admins to manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = uid()
      AND (
        auth.users.email = 'admin@tattsync.com'
        OR (auth.users.raw_user_meta_data->>'role') = 'admin'
      )
    )
  );