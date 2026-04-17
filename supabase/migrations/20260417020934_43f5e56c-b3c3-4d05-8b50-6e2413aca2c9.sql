ALTER TABLE public.accessories ALTER COLUMN no DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.accessories_no_seq;

WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at, id) AS new_no
  FROM public.accessories
)
UPDATE public.accessories a
SET no = r.new_no
FROM renumbered r
WHERE a.id = r.id;

CREATE OR REPLACE FUNCTION public.set_accessory_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.accessories
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_accessory_no ON public.accessories;
CREATE TRIGGER trg_set_accessory_no
BEFORE INSERT ON public.accessories
FOR EACH ROW
EXECUTE FUNCTION public.set_accessory_no();