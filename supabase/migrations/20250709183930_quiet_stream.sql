/*
  # Fix Users Table RLS Policy
  
  1. Changes
     - Drops the existing "Users can read own data" policy
     - Creates a new policy that allows users to read their own data
     - Additionally allows users with the 'admin' role to read all user records
*/

-- Update the existing policy to allow admins to read all user data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'::user_role)));