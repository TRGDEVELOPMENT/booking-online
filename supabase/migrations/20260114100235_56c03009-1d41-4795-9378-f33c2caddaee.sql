-- Create function to get next customer number per company
CREATE OR REPLACE FUNCTION public.get_next_customer_no(p_company_id text)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(MAX(no), 0) + 1 FROM public.customers WHERE company_id = p_company_id
$$;

-- Create trigger function to auto-set customer no per company
CREATE OR REPLACE FUNCTION public.set_customer_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    NEW.no := (SELECT COALESCE(MAX(no), 0) + 1 FROM public.customers WHERE company_id = NEW.company_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_customer_no ON public.customers;
CREATE TRIGGER trigger_set_customer_no
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_customer_no();

-- Remove default from no column so trigger handles it
ALTER TABLE public.customers ALTER COLUMN no DROP DEFAULT;