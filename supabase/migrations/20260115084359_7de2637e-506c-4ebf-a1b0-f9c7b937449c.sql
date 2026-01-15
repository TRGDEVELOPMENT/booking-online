-- 1. เปลี่ยน tax_id เป็น NOT NULL
ALTER TABLE public.customers 
ALTER COLUMN tax_id SET NOT NULL;

-- 2. เพิ่ม UNIQUE Constraint สำหรับ company_id + tax_id
ALTER TABLE public.customers 
ADD CONSTRAINT customers_company_tax_unique 
UNIQUE (company_id, tax_id);