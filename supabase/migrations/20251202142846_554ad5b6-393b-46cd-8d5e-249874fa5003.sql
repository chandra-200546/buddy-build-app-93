-- Add INSERT policy for expense_splits table
CREATE POLICY "Group members can add expense splits"
ON public.expense_splits
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expenses e
    JOIN public.group_members gm ON gm.group_id = e.group_id
    WHERE e.id = expense_id AND gm.user_id = auth.uid()
  )
);