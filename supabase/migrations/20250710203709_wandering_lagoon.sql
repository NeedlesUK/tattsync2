/*
  # Fix Studio Members RLS Policies

  This migration fixes the infinite recursion issue in the studio_members table policies
  by removing circular references and simplifying the policy logic.
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "studio_members_admin_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_manager_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_self_view" ON studio_members;
DROP POLICY IF EXISTS "studio_members_view_others" ON studio_members;

-- Create simplified policies without recursion
CREATE POLICY "studio_members_admin_full_access"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "studio_members_self_access"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "studio_members_manager_access"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    studio_id IN (
      SELECT s.id 
      FROM studios s
      WHERE s.id = studio_members.studio_id
      AND EXISTS (
        SELECT 1 FROM studio_members sm
        WHERE sm.studio_id = s.id
        AND sm.user_id = auth.uid()
        AND sm.role = 'studio_manager'
        AND sm.is_active = true
      )
    )
  );

CREATE POLICY "studio_members_view_same_studio"
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