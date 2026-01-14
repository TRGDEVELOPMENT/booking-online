-- Add customer_type column to customers table
ALTER TABLE public.customers 
ADD COLUMN customer_type text NOT NULL DEFAULT 'individual';

-- Add comment for clarity
COMMENT ON COLUMN public.customers.customer_type IS 'Customer type: individual (บุคคลธรรมดา) or corporate (นิติบุคคล)';