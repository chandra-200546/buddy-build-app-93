-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create trip groups" ON public.trip_groups;

-- Recreate as a permissive policy (default)
CREATE POLICY "Users can create trip groups"
  ON public.trip_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);