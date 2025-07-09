/*
  # Fix Admin Users Policy

  1. Security
    - Drops existing admin policy for users table
    - Creates a new policy that properly checks for admin role
    - Adds a policy for admins to view all users
    - Fixes the issue where admin users couldn't see other users
*/

-- Drop existing problematic policy if it exists
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create a new policy for admins to manage all users
CREATE POLICY "Admins can manage all users" 
ON public.users
FOR ALL 
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Create a policy specifically for admins to view all users
CREATE POLICY "Admins can view all users" 
ON public.users
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;