-- Create user_groups table to store editable info for each role
CREATE TABLE public.user_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (company_id, role_id)
);

ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view user_groups from their company"
ON public.user_groups
FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can insert user_groups for their company"
ON public.user_groups
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin'::app_role) OR public.has_role(auth.uid(), 'it'::app_role))
);

CREATE POLICY "Admins can update user_groups for their company"
ON public.user_groups
FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin'::app_role) OR public.has_role(auth.uid(), 'it'::app_role))
)
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'user_admin'::app_role) OR public.has_role(auth.uid(), 'it'::app_role))
);

CREATE TRIGGER update_user_groups_updated_at
BEFORE UPDATE ON public.user_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();