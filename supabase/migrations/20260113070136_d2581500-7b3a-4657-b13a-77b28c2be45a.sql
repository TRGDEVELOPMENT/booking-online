-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT NOT NULL UNIQUE,
  company_id TEXT NOT NULL,
  branch_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Customer info
  customer_type TEXT NOT NULL DEFAULT 'individual',
  customer_name TEXT NOT NULL,
  customer_id_card TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  
  -- Buyer info (if different from customer)
  buyer_name TEXT,
  buyer_id_card TEXT,
  buyer_phone TEXT,
  buyer_address TEXT,
  
  -- Vehicle info
  vehicle_type TEXT,
  model TEXT,
  submodel TEXT,
  color TEXT,
  fuel_type TEXT,
  
  -- Pricing
  list_price DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  net_price DECIMAL(12,2) DEFAULT 0,
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Dates
  expected_delivery_date DATE,
  
  -- Freebies, accessories, benefits (stored as JSONB)
  freebies JSONB DEFAULT '[]'::jsonb,
  accessories JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id
$$;

-- RLS Policies: Users can only see reservations from their own company
CREATE POLICY "Users can view reservations from their company"
  ON public.reservations FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create reservations for their company"
  ON public.reservations FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update reservations from their company"
  ON public.reservations FOR UPDATE
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete reservations from their company"
  ON public.reservations FOR DELETE
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_reservations_company_id ON public.reservations(company_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_created_at ON public.reservations(created_at DESC);