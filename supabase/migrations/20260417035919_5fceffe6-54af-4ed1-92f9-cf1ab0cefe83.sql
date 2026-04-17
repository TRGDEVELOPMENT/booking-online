-- 1) Renumber existing customers: running 'no' per company_id, ordered by created_at
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY company_id
    ORDER BY created_at, id
  ) AS new_no
  FROM public.customers
)
UPDATE public.customers c
SET no = r.new_no
FROM renumbered r
WHERE c.id = r.id;

-- 2) Ensure trigger to auto-increment 'no' per company_id (function already exists: set_customer_no)
DROP TRIGGER IF EXISTS trg_set_customer_no ON public.customers;
CREATE TRIGGER trg_set_customer_no
BEFORE INSERT ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.set_customer_no();

-- 3) Add unique constraint: tax_id must be unique within the same company_id
--    (different companies can share the same tax_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customers_company_tax_id_unique'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_company_tax_id_unique UNIQUE (company_id, tax_id);
  END IF;
END $$;