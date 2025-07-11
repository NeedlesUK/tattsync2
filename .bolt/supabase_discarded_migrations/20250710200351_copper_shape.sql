/*
  # Fix Studio RLS Infinite Recursion

  1. Disable RLS on studios table to break circular dependency
  2. Drop all problematic policies on studio_members
  3. Create simple, non-recursive policies
  4. Re-enable RLS with safe policies
*/

-- Temporarily disable RLS on studios to break circular dependency
ALTER TABLE studios DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on studio_members that cause recursion
DROP POLICY IF EXISTS "studios_admin_access" ON studio_members;
DROP POLICY IF EXISTS "studios_manager_access" ON studio_members;
DROP POLICY IF EXISTS "studios_member_view" ON studio_members;
DROP POLICY IF EXISTS "studio_members_admin_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_manager_access" ON studio_members;
DROP POLICY IF EXISTS "studio_members_self_view" ON studio_members;
DROP POLICY IF EXISTS "studio_members_view_others" ON studio_members;

-- Drop all existing policies on studios
DROP POLICY IF EXISTS "studios_admin_access" ON studios;
DROP POLICY IF EXISTS "studios_manager_access" ON studios;
DROP POLICY IF EXISTS "studios_member_view" ON studios;

-- Create simple, non-recursive policies for studio_members
CREATE POLICY "studio_members_admin_full_access" ON studio_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      JOIN users ON users.id = auth.users.id 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "studio_members_self_access" ON studio_members
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for studios
CREATE POLICY "studios_admin_full_access" ON studios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      JOIN users ON users.id = auth.users.id 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Re-enable RLS on studios
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;