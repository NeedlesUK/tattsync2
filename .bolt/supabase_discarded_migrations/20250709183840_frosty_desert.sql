/*
  # Update Users Table RLS Policies

  1. Changes
    - Update the "Users can read own data" policy to also allow admins to read all user data
    - This enables admin users to view all users in the User Management page
  
  2. Security
    - Maintains existing security for non-admin users (can only see their own data)
    - Adds ability for admin users to see all user records
*/

-- Update the existing policy to allow admins to read all user data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT
TO authenticated
USING (uid() = id OR (uid() IN (SELECT id FROM public.users WHERE role = 'admin')));