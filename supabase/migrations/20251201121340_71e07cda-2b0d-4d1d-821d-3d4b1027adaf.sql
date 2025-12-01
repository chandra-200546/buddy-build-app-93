-- Create a SECURITY DEFINER function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

-- Create a SECURITY DEFINER function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id AND is_admin = true
  )
$$;

-- Drop existing problematic policies on group_members
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups themselves" ON public.group_members;
DROP POLICY IF EXISTS "Group creators and admins can add members" ON public.group_members;

-- Recreate policies using the helper functions
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups themselves"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Group creators and admins can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    -- Allow if user is the group creator
    EXISTS (
      SELECT 1 FROM public.trip_groups
      WHERE id = group_members.group_id
      AND created_by = auth.uid()
    )
    OR
    -- Or if user is already an admin in the group (using helper function)
    public.is_group_admin(group_id, auth.uid())
  );