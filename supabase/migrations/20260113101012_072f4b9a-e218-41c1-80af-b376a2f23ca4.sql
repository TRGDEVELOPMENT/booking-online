-- Create models table
CREATE TABLE public.models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  company_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Create policies for company-based access
CREATE POLICY "Users can view models from their company"
ON public.models
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create models for their company"
ON public.models
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update models from their company"
ON public.models
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete models from their company"
ON public.models
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON public.models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for BPK company
INSERT INTO public.models (description, company_id, status) VALUES
('Nissan Kicks', 'BPK', 'active'),
('Nissan Almera', 'BPK', 'active'),
('Nissan Navara', 'BPK', 'active'),
('Isuzu D-Max', 'BPK', 'active'),
('Isuzu MU-X', 'BPK', 'active');