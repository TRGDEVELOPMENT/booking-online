-- Create installment_periods table
CREATE TABLE public.installment_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.installment_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies (company-scoped, mirror other master tables)
CREATE POLICY "Users can view installment_periods from their company"
ON public.installment_periods FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create installment_periods for their company"
ON public.installment_periods FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update installment_periods from their company"
ON public.installment_periods FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete installment_periods from their company"
ON public.installment_periods FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Auto-running no. per company
CREATE OR REPLACE FUNCTION public.set_installment_period_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    SELECT COALESCE(MAX(no), 0) + 1 INTO NEW.no
    FROM public.installment_periods
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_installment_period_no_trigger
BEFORE INSERT ON public.installment_periods
FOR EACH ROW EXECUTE FUNCTION public.set_installment_period_no();

-- updated_at trigger
CREATE TRIGGER update_installment_periods_updated_at
BEFORE UPDATE ON public.installment_periods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();