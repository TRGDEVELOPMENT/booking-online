CREATE OR REPLACE FUNCTION public.generate_document_number(p_company_id text, p_branch_id text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix text;
  v_year_month text;
  v_next_number integer;
  v_doc_number text;
BEGIN
  -- Format: {branch_id}RS-{YYMM}{5-digit running}
  -- branch_id must be 3-char branch code (e.g. BPK, LAC)
  v_prefix := COALESCE(p_branch_id, '') || 'RS';

  v_year_month := to_char(CURRENT_DATE, 'YYMM');

  INSERT INTO public.document_sequences (prefix, year_month, last_number)
  VALUES (v_prefix, v_year_month, 1)
  ON CONFLICT (prefix, year_month)
  DO UPDATE SET last_number = document_sequences.last_number + 1
  RETURNING last_number INTO v_next_number;

  -- Final format: PREFIX-YYMM00001
  v_doc_number := v_prefix || '-' || v_year_month || LPAD(v_next_number::text, 5, '0');

  RETURN v_doc_number;
END;
$function$;