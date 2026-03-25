
CREATE TABLE public.team_cancel_approval_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.sales_teams(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  assigned_user_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, stage)
);

ALTER TABLE public.team_cancel_approval_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage team_cancel_approval_templates"
  ON public.team_cancel_approval_templates
  FOR ALL
  TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
  )
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
  );

CREATE POLICY "Users can view team_cancel_approval_templates from their company"
  ON public.team_cancel_approval_templates
  FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE TRIGGER update_team_cancel_approval_templates_updated_at
  BEFORE UPDATE ON public.team_cancel_approval_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
