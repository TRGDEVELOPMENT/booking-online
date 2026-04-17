ALTER TABLE public.benefits ALTER COLUMN no DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.benefits_no_seq;

WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at, id) AS new_no
  FROM public.benefits
)
UPDATE public.benefits b
SET no = r.new_no
FROM renumbered r
WHERE b.id = r.id;

CREATE OR REPLACE FUNCTION public.set_benefit_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.benefits
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_benefit_no ON public.benefits;
CREATE TRIGGER trg_set_benefit_no
BEFORE INSERT ON public.benefits
FOR EACH ROW
EXECUTE FUNCTION public.set_benefit_no();