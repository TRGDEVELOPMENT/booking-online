-- Create sequence for benefits no
CREATE SEQUENCE IF NOT EXISTS benefits_no_seq;

-- Create benefits table
CREATE TABLE public.benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no INTEGER NOT NULL DEFAULT nextval('benefits_no_seq'),
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view benefits from their company"
ON public.benefits FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create benefits for their company"
ON public.benefits FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update benefits from their company"
ON public.benefits FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete benefits from their company"
ON public.benefits FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_benefits_updated_at
BEFORE UPDATE ON public.benefits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();