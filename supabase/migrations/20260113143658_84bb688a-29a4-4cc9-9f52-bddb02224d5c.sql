-- Create standard_prices table
CREATE TABLE public.standard_prices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no SERIAL NOT NULL,
    model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    sub_model_id UUID NOT NULL REFERENCES public.sub_models(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    company_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.standard_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view standard_prices from their company"
ON public.standard_prices
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create standard_prices for their company"
ON public.standard_prices
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update standard_prices from their company"
ON public.standard_prices
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete standard_prices from their company"
ON public.standard_prices
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_standard_prices_updated_at
BEFORE UPDATE ON public.standard_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();