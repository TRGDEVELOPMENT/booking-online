-- Create engine_sizes table
CREATE TABLE public.engine_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no SERIAL NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.engine_sizes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view engine sizes from their company"
ON public.engine_sizes
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create engine sizes for their company"
ON public.engine_sizes
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update engine sizes from their company"
ON public.engine_sizes
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete engine sizes from their company"
ON public.engine_sizes
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_engine_sizes_updated_at
BEFORE UPDATE ON public.engine_sizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();