/*
  # Fix infinite recursion in users table RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create simplified policies that don't reference the users table recursively
    - Ensure admins can manage users and users can manage their own data

  The issue was caused by policies that referenced the users table within themselves,
  creating circular dependencies when Supabase tried to evaluate permissions.
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create simplified policies without recursive references
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policy using auth.jwt() to check claims instead of table lookup
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@tattsync.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );