-- Renumber existing colors per company + model + sub_model to ensure consistency
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY company_id, model_id, sub_model_id
    ORDER BY created_at, id
  ) AS new_no
  FROM public.colors
)
UPDATE public.colors c
SET no = r.new_no
FROM renumbered r
WHERE c.id = r.id;

-- Ensure trigger exists (function already defined as set_color_no)
DROP TRIGGER IF EXISTS trg_set_color_no ON public.colors;
CREATE TRIGGER trg_set_color_no
BEFORE INSERT ON public.colors
FOR EACH ROW
EXECUTE FUNCTION public.set_color_no();