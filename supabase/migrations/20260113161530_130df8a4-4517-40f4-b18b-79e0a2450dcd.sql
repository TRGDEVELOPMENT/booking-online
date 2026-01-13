-- Create sequence for freebies no
CREATE SEQUENCE IF NOT EXISTS freebies_no_seq;

-- Create freebies table
CREATE TABLE public.freebies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no INTEGER NOT NULL DEFAULT nextval('freebies_no_seq'),
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.freebies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view freebies from their company"
ON public.freebies FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create freebies for their company"
ON public.freebies FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update freebies from their company"
ON public.freebies FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete freebies from their company"
ON public.freebies FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_freebies_updated_at
BEFORE UPDATE ON public.freebies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();