-- Create storage bucket for reservation attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reservation-attachments', 
  'reservation-attachments', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Create table for reservation attachments
CREATE TABLE public.reservation_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reservation_attachments
CREATE POLICY "Users can view attachments of their company"
  ON public.reservation_attachments
  FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert attachments for their company"
  ON public.reservation_attachments
  FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete attachments of their company"
  ON public.reservation_attachments
  FOR DELETE
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Storage policies for reservation-attachments bucket
CREATE POLICY "Anyone can view reservation attachments"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reservation-attachments');

CREATE POLICY "Authenticated users can upload reservation attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'reservation-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete reservation attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'reservation-attachments' 
    AND auth.role() = 'authenticated'
  );

-- Create index for faster lookups
CREATE INDEX idx_reservation_attachments_reservation_id 
  ON public.reservation_attachments(reservation_id);

CREATE INDEX idx_reservation_attachments_company_id 
  ON public.reservation_attachments(company_id);