-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.trip_groups;

-- Create updated SELECT policy that allows both members and creators to view
CREATE POLICY "Users can view groups they are members of or created"
  ON public.trip_groups FOR SELECT
  TO authenticated
  USING (
    -- User is the creator of the group
    auth.uid() = created_by
    OR
    -- User is a member of the group
    public.is_group_member(id, auth.uid())
  );