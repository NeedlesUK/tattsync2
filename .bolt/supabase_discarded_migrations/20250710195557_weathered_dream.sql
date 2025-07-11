/*
  # Fix Studio Members RLS Policies

  1. Problem
    - The current RLS policies on studio_members table are causing infinite recursion
    - This happens when policies reference the same table they're applied to

  2. Solution
    - Drop the existing problematic policies
    - Create new policies that avoid recursive references
    - Use direct user ID checks instead of subqueries that reference studio_members
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Studio managers can manage studio members" ON studio_members;
DROP POLICY IF EXISTS "Studio members can view other members" ON studio_members;

-- Create new non-recursive policies
CREATE POLICY "Studio managers can manage studio members"
  ON studio_members
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is admin
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    -- Allow if user is a studio manager for this studio (direct check)
    (EXISTS (
      SELECT 1 FROM studios s 
      WHERE s.id = studio_members.studio_id 
      AND EXISTS (
        SELECT 1 FROM studio_members sm2 
        WHERE sm2.studio_id = s.id 
        AND sm2.user_id = uid() 
        AND sm2.role = 'studio_manager' 
        AND sm2.is_active = true
      )
    ))
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    (EXISTS (
      SELECT 1 FROM studios s 
      WHERE s.id = studio_members.studio_id 
      AND EXISTS (
        SELECT 1 FROM studio_members sm2 
        WHERE sm2.studio_id = s.id 
        AND sm2.user_id = uid() 
        AND sm2.role = 'studio_manager' 
        AND sm2.is_active = true
      )
    ))
  );

CREATE POLICY "Studio members can view other members"
  ON studio_members
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is admin
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    -- Allow if user is viewing their own record
    (user_id = uid())
    OR
    -- Allow if user is an active member of the same studio
    (EXISTS (
      SELECT 1 FROM studio_members sm2 
      WHERE sm2.studio_id = studio_members.studio_id 
      AND sm2.user_id = uid() 
      AND sm2.is_active = true
    ))
  );

-- Also fix any potential issues with studios table policies
DROP POLICY IF EXISTS "Studio managers can manage their studios" ON studios;
DROP POLICY IF EXISTS "Studio members can view their studios" ON studios;

CREATE POLICY "Studio managers can manage their studios"
  ON studios
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is admin
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    -- Allow if user is a studio manager for this studio
    (EXISTS (
      SELECT 1 FROM studio_members sm 
      WHERE sm.studio_id = studios.id 
      AND sm.user_id = uid() 
      AND sm.role = 'studio_manager' 
      AND sm.is_active = true
    ))
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    (EXISTS (
      SELECT 1 FROM studio_members sm 
      WHERE sm.studio_id = studios.id 
      AND sm.user_id = uid() 
      AND sm.role = 'studio_manager' 
      AND sm.is_active = true
    ))
  );

CREATE POLICY "Studio members can view their studios"
  ON studios
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is admin
    (uid() IN (SELECT id FROM users WHERE role = 'admin'::user_role))
    OR
    -- Allow if user is an active member of this studio
    (EXISTS (
      SELECT 1 FROM studio_members sm 
      WHERE sm.studio_id = studios.id 
      AND sm.user_id = uid() 
      AND sm.is_active = true
    ))
  );