
-- Create team_approval_templates table
CREATE TABLE public.team_approval_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.sales_teams(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  assigned_user_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, stage)
);

-- Enable RLS
ALTER TABLE public.team_approval_templates ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users in same company
CREATE POLICY "Users can view team_approval_templates from their company"
ON public.team_approval_templates FOR SELECT TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- ALL: admin/it can manage
CREATE POLICY "Admin can manage team_approval_templates"
ON public.team_approval_templates FOR ALL TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
)
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
);

-- Add updated_at trigger
CREATE TRIGGER update_team_approval_templates_updated_at
  BEFORE UPDATE ON public.team_approval_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
