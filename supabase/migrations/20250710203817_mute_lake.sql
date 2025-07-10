/*
  # Fix Studio Members RLS Policy Recursion

  This migration fixes the infinite recursion issue in studio_members table policies
  by removing circular dependencies and simplifying the policy structure.
*/

-- Drop all existing policies on studio_members to start fresh
DROP POLICY IF EXISTS "studio_members_admin_full_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_manager_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_self_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_view_same_studio" ON studio_members;

-- Drop all existing policies on studios that might cause recursion
DROP POLICY IF EXISTS "studios_admin_access" ON studios;
DROP POLICY IF EXISTS "studios_manager_access" ON studios;
DROP POLICY IF EXISTS "studios_member_view" ON studios;

-- Create simple, non-recursive policies for studio_members
CREATE POLICY "studio_members_admin_access"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "studio_members_self_manage"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "studio_members_manager_manage"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    studio_id IN (
      SELECT sm.studio_id 
      FROM studio_members sm 
      WHERE sm.user_id = auth.uid() 
      AND sm.role = 'studio_manager' 
      AND sm.is_active = true
    )
  );

CREATE POLICY "studio_members_view_colleagues"
  ON studio_members
  FOR SELECT
  TO authenticated
  USING (
    studio_id IN (
      SELECT sm.studio_id 
      FROM studio_members sm 
      WHERE sm.user_id = auth.uid() 
      AND sm.is_active = true
    )
  );

-- Create simple, non-recursive policies for studios
CREATE POLICY "studios_admin_full_access"
  ON studios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "studios_manager_access"
  ON studios
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT sm.studio_id 
      FROM studio_members sm 
      WHERE sm.user_id = auth.uid() 
      AND sm.role = 'studio_manager' 
      AND sm.is_active = true
    )
  );

CREATE POLICY "studios_member_view"
  ON studios
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT sm.studio_id 
      FROM studio_members sm 
      WHERE sm.user_id = auth.uid() 
      AND sm.is_active = true
    )
  );

-- Ensure RLS is enabled on both tables
ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;