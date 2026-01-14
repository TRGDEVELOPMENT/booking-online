-- Add address fields to customers table
ALTER TABLE public.customers
ADD COLUMN address1 TEXT,
ADD COLUMN address2 TEXT,
ADD COLUMN district TEXT,
ADD COLUMN province TEXT,
ADD COLUMN postal_code TEXT;