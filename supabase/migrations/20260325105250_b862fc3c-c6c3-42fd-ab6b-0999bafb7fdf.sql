
-- Create reservation_activity_logs table (append-only audit trail)
CREATE TABLE public.reservation_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_label TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID NOT NULL,
  performed_by_name TEXT,
  company_id TEXT NOT NULL,
  branch_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_activity_logs_reservation_id ON public.reservation_activity_logs(reservation_id);
CREATE INDEX idx_activity_logs_company_id ON public.reservation_activity_logs(company_id);

-- Enable RLS
ALTER TABLE public.reservation_activity_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: same company can view
CREATE POLICY "Users can view activity logs from their company"
ON public.reservation_activity_logs
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- INSERT: same company can insert
CREATE POLICY "Users can insert activity logs for their company"
ON public.reservation_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- No UPDATE or DELETE policies (append-only)
