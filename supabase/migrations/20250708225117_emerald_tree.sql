/*
  # Add Password Reset Function
  
  1. New Functions
    - `admin_reset_password` - Allows admins to reset a user's password
    
  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Only accessible to users with admin role
    - Uses search_path to prevent SQL injection
    
  3. Usage
    - Call from SQL: SELECT admin_reset_password('user_id', 'new_password');
    - Call from Supabase client: supabase.rpc('admin_reset_password', { user_id: 'uuid', new_password: 'password' })
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