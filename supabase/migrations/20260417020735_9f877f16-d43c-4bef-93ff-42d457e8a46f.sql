-- Drop default that uses global sequence
ALTER TABLE public.freebies ALTER COLUMN no DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.freebies_no_seq;

-- Re-number existing rows per company_id ordered by created_at
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at, id) AS new_no
  FROM public.freebies
)
UPDATE public.freebies f
SET no = r.new_no
FROM renumbered r
WHERE f.id = r.id;

-- Trigger function to assign next no per company_id
CREATE OR REPLACE FUNCTION public.set_freebie_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.freebies
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_freebie_no ON public.freebies;
CREATE TRIGGER trg_set_freebie_no
BEFORE INSERT ON public.freebies
FOR EACH ROW
EXECUTE FUNCTION public.set_freebie_no();