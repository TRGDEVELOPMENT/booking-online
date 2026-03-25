
-- Sales Teams table
CREATE TABLE public.sales_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  supervisor_id UUID NOT NULL,
  branch_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales Team Members table
CREATE TABLE public.sales_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.sales_teams(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_team_members ENABLE ROW LEVEL SECURITY;

-- RLS for sales_teams
CREATE POLICY "Users can view sales_teams from their company" ON public.sales_teams
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin can manage sales_teams" ON public.sales_teams
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it')))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it')));

-- RLS for sales_team_members
CREATE POLICY "Users can view sales_team_members from their company" ON public.sales_team_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sales_teams st WHERE st.id = team_id AND st.company_id = get_user_company_id(auth.uid())
  ));

CREATE POLICY "Admin can manage sales_team_members" ON public.sales_team_members
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sales_teams st WHERE st.id = team_id AND st.company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sales_teams st WHERE st.id = team_id AND st.company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
  ));

-- Updated_at trigger
CREATE TRIGGER update_sales_teams_updated_at
  BEFORE UPDATE ON public.sales_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
