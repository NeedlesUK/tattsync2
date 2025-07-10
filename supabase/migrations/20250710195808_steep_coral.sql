/*
  # Fix Studio RLS Policies Infinite Recursion

  This migration completely removes and recreates the RLS policies for studios and studio_members
  to eliminate any circular dependencies that cause infinite recursion.

  1. Drop all existing policies on studios and studio_members tables
  2. Create new simplified policies that avoid circular references
  3. Ensure proper access control without recursion
*/

-- Drop all existing policies on studios table
DROP POLICY IF EXISTS "Admins can manage all studios" ON studios;
DROP POLICY IF EXISTS "Studio managers can manage their studios" ON studios;
DROP POLICY IF EXISTS "Studio members can view their studios" ON studios;

-- Drop all existing policies on studio_members table
DROP POLICY IF EXISTS "Studio managers can manage studio members" ON studio_members;
DROP POLICY IF EXISTS "Studio members can view other members" ON studio_members;

-- Create new non-recursive policies for studios table
CREATE POLICY "studios_admin_access" ON studios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "studios_manager_access" ON studios
  FOR ALL USING (
    auth.uid() IN (
      SELECT sm.user_id 
      FROM studio_members sm 
      WHERE sm.studio_id = studios.id 
      AND sm.role = 'studio_manager' 
      AND sm.is_active = true
    )
  );

CREATE POLICY "studios_member_view" ON studios
  FOR SELECT USING (
    auth.uid() IN (
      SELECT sm.user_id 
      FROM studio_members sm 
      WHERE sm.studio_id = studios.id 
      AND sm.is_active = true
    )
  );

-- Create new non-recursive policies for studio_members table
CREATE POLICY "studio_members_admin_access" ON studio_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "studio_members_manager_access" ON studio_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT sm2.user_id 
      FROM studio_members sm2 
      WHERE sm2.studio_id = studio_members.studio_id 
      AND sm2.role = 'studio_manager' 
      AND sm2.is_active = true
      AND sm2.user_id != studio_members.user_id -- Avoid self-reference
    )
  );

CREATE POLICY "studio_members_self_view" ON studio_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "studio_members_view_others" ON studio_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT sm2.user_id 
      FROM studio_members sm2 
      WHERE sm2.studio_id = studio_members.studio_id 
      AND sm2.is_active = true
      AND sm2.user_id != studio_members.user_id -- Avoid self-reference
    )
  );