-- 1) Drop identity from 'no' column to allow manual control
ALTER TABLE public.branches ALTER COLUMN no DROP IDENTITY IF EXISTS;

-- 2) Renumber existing branches: running 'no' per company_id
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY company_id
    ORDER BY created_at, id
  ) AS new_no
  FROM public.branches
)
UPDATE public.branches b
SET no = r.new_no
FROM renumbered r
WHERE b.id = r.id;

-- 3) Create trigger function to auto-increment 'no' per company_id
CREATE OR REPLACE FUNCTION public.set_branch_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.branches
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Attach trigger to branches table
DROP TRIGGER IF EXISTS trg_set_branch_no ON public.branches;
CREATE TRIGGER trg_set_branch_no
BEFORE INSERT ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.set_branch_no();