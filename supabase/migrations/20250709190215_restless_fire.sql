/*
  # Fix infinite recursion in users table RLS policies

  1. Changes
     - Drops all existing problematic policies on the users table
     - Creates new policies that avoid recursive lookups
     - Uses auth.jwt() for admin checks instead of table self-references
     - Adds proper policies for users to manage their own data

  2. Security
     - Maintains same security model but fixes infinite recursion
     - Ensures users can only access their own data
     - Admins can still manage all users
*/

-- Drop all existing policies on the users table to start fresh
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Create new policies that avoid recursive lookups

-- Admin policy using JWT claims instead of table self-reference
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@tattsync.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- User policies for self-management
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;