-- Create colors table
CREATE TABLE public.colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no SERIAL,
  description TEXT NOT NULL,
  hex_color TEXT NOT NULL DEFAULT '#000000',
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view colors from their company"
ON public.colors
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create colors for their company"
ON public.colors
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update colors from their company"
ON public.colors
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete colors from their company"
ON public.colors
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_colors_updated_at
BEFORE UPDATE ON public.colors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.colors (description, hex_color, status, company_id) VALUES
('ขาวมุก', '#FFFFFF', 'active', 'BPK'),
('ดำเมทัลลิก', '#1a1a2e', 'active', 'BPK'),
('เทาเงิน', '#C0C0C0', 'active', 'BPK'),
('แดงเมทัลลิก', '#8B0000', 'active', 'BPK'),
('น้ำเงินเข้ม', '#00008B', 'active', 'BPK');