/*
  # Fix Studio Members Infinite Recursion

  This migration fixes the infinite recursion issue in studio_members RLS policies
  by completely removing and recreating them with non-recursive logic.
*/

-- Drop all existing policies on studio_members to break recursion
DROP POLICY IF EXISTS "studio_members_admin_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_manager_manage" ON studio_members;
DROP POLICY IF EXISTS "studio_members_self_manage" ON studio_members;
DROP POLICY IF EXISTS "studio_members_view_colleagues" ON studio_members;

-- Temporarily disable RLS to allow the query to work
ALTER TABLE studio_members DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "studio_members_select_all" 
ON studio_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "studio_members_insert_own" 
ON studio_members FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "studio_members_update_own" 
ON studio_members FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "studio_members_delete_own" 
ON studio_members FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());