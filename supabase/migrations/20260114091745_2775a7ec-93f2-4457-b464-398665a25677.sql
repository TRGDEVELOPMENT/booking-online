-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS surnames_no_seq;
CREATE SEQUENCE IF NOT EXISTS customers_no_seq;

-- Create surnames table (คำนำหน้าชื่อ)
CREATE TABLE public.surnames (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no INTEGER NOT NULL DEFAULT nextval('surnames_no_seq'::regclass),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    company_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for surnames
ALTER TABLE public.surnames ENABLE ROW LEVEL SECURITY;

-- RLS policies for surnames
CREATE POLICY "Users can view surnames from their company"
ON public.surnames FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create surnames for their company"
ON public.surnames FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update surnames from their company"
ON public.surnames FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete surnames from their company"
ON public.surnames FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create customers table (ข้อมูลลูกค้า)
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no INTEGER NOT NULL DEFAULT nextval('customers_no_seq'::regclass),
    surname_id UUID REFERENCES public.surnames(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    telephone TEXT,
    mobile_phone TEXT,
    email TEXT,
    tax_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    company_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS policies for customers
CREATE POLICY "Users can view customers from their company"
ON public.customers FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create customers for their company"
ON public.customers FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update customers from their company"
ON public.customers FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete customers from their company"
ON public.customers FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));