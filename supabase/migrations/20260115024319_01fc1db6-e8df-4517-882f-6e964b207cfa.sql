-- 1. เพิ่ม column customer_id
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS customer_id text;

-- 2. สร้าง function generate รหัสลูกค้า
CREATE OR REPLACE FUNCTION public.generate_customer_id(p_company_id text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_year text;
  v_next_no integer;
  v_customer_id text;
BEGIN
  -- ดึงปี 2 หลัก (YY)
  v_year := to_char(CURRENT_DATE, 'YY');
  
  -- หา running number ถัดไปของ company + ปีนี้
  SELECT COALESCE(MAX(
    CASE 
      WHEN customer_id LIKE 'CUSRS' || v_year || '%' 
      THEN CAST(RIGHT(customer_id, 6) AS integer)
      ELSE 0 
    END
  ), 0) + 1
  INTO v_next_no
  FROM public.customers 
  WHERE company_id = p_company_id;
  
  -- สร้างรหัสลูกค้า format: CUSRS + YY + 6 digits
  v_customer_id := 'CUSRS' || v_year || LPAD(v_next_no::text, 6, '0');
  
  RETURN v_customer_id;
END;
$$;

-- 3. แก้ไข trigger function ให้ generate customer_id ด้วย
CREATE OR REPLACE FUNCTION public.set_customer_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Generate running no per company
  IF NEW.no IS NULL OR NEW.no = 0 THEN
    NEW.no := (SELECT COALESCE(MAX(no), 0) + 1 
               FROM public.customers 
               WHERE company_id = NEW.company_id);
  END IF;
  
  -- Generate customer_id per company
  IF NEW.customer_id IS NULL OR NEW.customer_id = '' THEN
    NEW.customer_id := public.generate_customer_id(NEW.company_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. อัพเดทข้อมูลเก่าให้มี customer_id
UPDATE public.customers c
SET customer_id = 'CUSRS' || to_char(c.created_at, 'YY') || LPAD(c.no::text, 6, '0')
WHERE customer_id IS NULL;

-- 5. ทำให้ customer_id เป็น NOT NULL
ALTER TABLE public.customers 
ALTER COLUMN customer_id SET NOT NULL;