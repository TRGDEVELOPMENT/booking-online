-- Fix legacy test profiles that had wrong branch_id for their company
UPDATE public.profiles SET branch_id = 'LRA' WHERE username IN ('sale','useradmin','itadmin') AND company_id = 'LAC';