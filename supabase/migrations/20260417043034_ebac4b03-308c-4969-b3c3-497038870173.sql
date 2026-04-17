ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.sales_teams(id) ON DELETE SET NULL;