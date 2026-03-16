
-- Create branches table
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no integer NOT NULL GENERATED ALWAYS AS IDENTITY,
  branch_id text NOT NULL,
  branch_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  company_id text NOT NULL,
  doc_prefix text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (company_id, branch_id)
);

-- Constraint: branch_id must be exactly 3 uppercase letters
ALTER TABLE public.branches ADD CONSTRAINT branch_id_format CHECK (branch_id ~ '^[A-Za-z0-9]{3}$');

-- Constraint: branch_name max 100 chars
ALTER TABLE public.branches ADD CONSTRAINT branch_name_length CHECK (char_length(branch_name) <= 100);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS policies (company-scoped)
CREATE POLICY "Users can view branches from their company"
  ON public.branches FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create branches for their company"
  ON public.branches FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update branches from their company"
  ON public.branches FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete branches from their company"
  ON public.branches FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Update trigger for updated_at
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update generate_document_number to use doc_prefix from branches table
CREATE OR REPLACE FUNCTION public.generate_document_number(p_company_id text, p_branch_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prefix text;
  v_year_month text;
  v_next_number integer;
  v_doc_number text;
BEGIN
  -- Look up doc_prefix from branches table
  SELECT doc_prefix INTO v_prefix
  FROM public.branches
  WHERE company_id = p_company_id AND branch_id = p_branch_id AND status = 'active'
  LIMIT 1;

  -- Fallback if not found
  IF v_prefix IS NULL OR v_prefix = '' THEN
    v_prefix := p_company_id || p_branch_id || 'RS';
  END IF;

  -- Get current YYMM
  v_year_month := to_char(CURRENT_DATE, 'YYMM');

  -- Atomic upsert to get next number
  INSERT INTO public.document_sequences (prefix, year_month, last_number)
  VALUES (v_prefix, v_year_month, 1)
  ON CONFLICT (prefix, year_month)
  DO UPDATE SET last_number = document_sequences.last_number + 1
  RETURNING last_number INTO v_next_number;

  -- Format: PREFIX-YYMM00001
  v_doc_number := v_prefix || '-' || v_year_month || LPAD(v_next_number::text, 5, '0');

  RETURN v_doc_number;
END;
$$;
