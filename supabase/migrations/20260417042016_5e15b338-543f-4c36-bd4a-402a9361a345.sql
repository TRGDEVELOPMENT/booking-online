-- 1) Add 'no' column to sales_teams
ALTER TABLE public.sales_teams 
ADD COLUMN IF NOT EXISTS no integer NOT NULL DEFAULT 0;

-- 2) Renumber existing teams: running 'no' per company_id + branch_id
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY company_id, branch_id
    ORDER BY created_at, id
  ) AS new_no
  FROM public.sales_teams
)
UPDATE public.sales_teams t
SET no = r.new_no
FROM renumbered r
WHERE t.id = r.id;

-- 3) Trigger function to auto-increment 'no' per company_id + branch_id
CREATE OR REPLACE FUNCTION public.set_sales_team_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.sales_teams
    WHERE company_id = NEW.company_id
      AND branch_id = NEW.branch_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Attach trigger
DROP TRIGGER IF EXISTS trg_set_sales_team_no ON public.sales_teams;
CREATE TRIGGER trg_set_sales_team_no
BEFORE INSERT ON public.sales_teams
FOR EACH ROW
EXECUTE FUNCTION public.set_sales_team_no();