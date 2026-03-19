
-- Remove the default sequence from no column
ALTER TABLE public.colors ALTER COLUMN no DROP DEFAULT;

-- Drop the old sequence if exists
DROP SEQUENCE IF EXISTS colors_no_seq;

-- Create trigger function for running no per company + model + sub_model
CREATE OR REPLACE FUNCTION public.set_color_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.colors
    WHERE company_id = NEW.company_id
      AND model_id IS NOT DISTINCT FROM NEW.model_id
      AND sub_model_id IS NOT DISTINCT FROM NEW.sub_model_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trg_set_color_no
  BEFORE INSERT ON public.colors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_color_no();
