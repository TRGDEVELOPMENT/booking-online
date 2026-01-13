-- Create vehicle_types table for master data
CREATE TABLE public.vehicle_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no SERIAL,
    description TEXT NOT NULL,
    company_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

-- Create policies for company-based access
CREATE POLICY "Users can view vehicle types from their company" 
ON public.vehicle_types 
FOR SELECT 
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can create vehicle types for their company" 
ON public.vehicle_types 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update vehicle types from their company" 
ON public.vehicle_types 
FOR UPDATE 
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete vehicle types from their company" 
ON public.vehicle_types 
FOR DELETE 
USING (company_id = get_user_company_id(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vehicle_types_updated_at
BEFORE UPDATE ON public.vehicle_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for BPK company
INSERT INTO public.vehicle_types (description, company_id) VALUES
('รถยนต์ส่วนบุคคลไม่เกิน 7 ที่นั่ง', 'BPK'),
('รถยนต์กระบะ', 'BPK');