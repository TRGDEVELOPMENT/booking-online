
-- Add status column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Allow admin/it to update profiles in their company
CREATE POLICY "Admin can update company profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it'))
)
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it'))
);
