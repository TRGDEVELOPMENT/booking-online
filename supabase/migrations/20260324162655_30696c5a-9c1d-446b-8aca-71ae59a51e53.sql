
-- 1. Create reservation_assignments table
CREATE TABLE public.reservation_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  stage text NOT NULL,
  assigned_user_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  company_id text NOT NULL,
  branch_id text,
  UNIQUE (reservation_id, stage)
);

-- Enable RLS
ALTER TABLE public.reservation_assignments ENABLE ROW LEVEL SECURITY;

-- SELECT: view by company + branch
CREATE POLICY "View assignments by company and branch"
ON public.reservation_assignments FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (
    branch_id IS NULL
    OR branch_id = (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
    OR (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid()) IS NULL
  )
);

-- INSERT/UPDATE/DELETE: admin or it only
CREATE POLICY "Admin can manage assignments"
ON public.reservation_assignments FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it'))
)
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it'))
);

-- 2. Add cashier columns to reservations
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS cashier_user_id uuid;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS cashier_user_name text;

-- 3. Allow admin/it to view all profiles in their company
CREATE POLICY "Admin can view company profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it'))
);

-- 4. Allow admin/it to view user_roles for assignment purposes
CREATE POLICY "Admin can view user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'user_admin') OR public.has_role(auth.uid(), 'it')
);
