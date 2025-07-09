/*
  # Fix admin access policy

  1. Changes
     - Drop existing policy for users table
     - Create new policy that properly handles admin access
     - Use proper syntax for checking admin role
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Create a new policy that allows users to read their own data and admins to read all data
CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR (EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = auth.uid() AND
  raw_user_meta_data->>'role' = 'admin'
)));