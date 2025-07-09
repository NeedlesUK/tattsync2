/*
  # Fix Admin Users Policy

  1. Changes
     - Drop existing problematic policies
     - Create new policies with proper auth.uid() checks
     - Ensure RLS is enabled on users table
     - Add policy for admins to view all users
*/

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

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
  ) OR 
  auth.uid() = id
);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;