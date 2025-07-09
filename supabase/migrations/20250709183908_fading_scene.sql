/*
  # Update users table RLS policy

  1. Security
    - Update the existing policy to allow admins to read all user data
    - Replace uid() with auth.uid() for proper authentication function reference
*/

-- Update the existing policy to allow admins to read all user data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')));