/*
  # Fix users policy for admin access

  1. Security
    - Update the policy to allow admins to read all user data
    - Fix the auth.uid() function usage
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Create a new policy that allows users to read their own data and admins to read all data
CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')));