/*
  # Admin Password Reset Function
  
  1. New Functions
    - `admin_reset_password` - Allows admins to reset user passwords
    
  2. Security
    - Ensures only admin users can reset passwords
    - Validates password length
    - Uses secure password hashing
    - Runs with elevated privileges (SECURITY DEFINER)
    
  3. Usage
    - Call from application code using RPC
    - Requires admin authentication
*/

-- Create function to reset a user's password
CREATE OR REPLACE FUNCTION admin_reset_password(user_id UUID, new_password TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  calling_user_id UUID;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Check if the calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = calling_user_id AND role = 'admin'
  ) INTO is_admin;
  
  -- Only allow admins to reset passwords
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can reset passwords';
  END IF;
  
  -- Validate password
  IF LENGTH(new_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long';
  END IF;
  
  -- Update the password in auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_reset_password(UUID, TEXT) TO authenticated;

-- Verify the function was created
DO $$
DECLARE
  function_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'admin_reset_password'
  ) INTO function_exists;
  
  IF function_exists THEN
    RAISE NOTICE 'admin_reset_password function created successfully';
  ELSE
    RAISE WARNING 'Failed to create admin_reset_password function';
  END IF;
END
$$;