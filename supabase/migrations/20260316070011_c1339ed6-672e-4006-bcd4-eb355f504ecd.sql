
-- 1. Create document_sequences table
CREATE TABLE public.document_sequences (
  prefix text NOT NULL,
  year_month text NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year_month)
);

-- Enable RLS
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

-- RLS: allow authenticated users to select/insert/update
CREATE POLICY "Authenticated users can manage document_sequences"
  ON public.document_sequences
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Create generate_document_number function
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
  -- Determine prefix based on company and branch
  CASE p_company_id
    WHEN 'BPK' THEN v_prefix := 'BPKRS';
    WHEN 'VPA' THEN v_prefix := 'VPARS';
    WHEN 'LAC' THEN
      CASE p_branch_id
        WHEN 'br-LAC-01' THEN v_prefix := 'LRARS';
        WHEN 'br-LAC-02' THEN v_prefix := 'LSVRS';
        ELSE v_prefix := 'LACRS';
      END CASE;
    WHEN 'ICCK' THEN
      CASE p_branch_id
        WHEN 'br-ICCK-01' THEN v_prefix := 'ICKRS';
        WHEN 'br-ICCK-02' THEN v_prefix := 'IKKRS';
        ELSE v_prefix := 'ICCKRS';
      END CASE;
    ELSE v_prefix := p_company_id || 'RS';
  END CASE;

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
