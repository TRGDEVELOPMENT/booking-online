
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS cancel_request_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_requested_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_requested_by uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_review_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_reviewed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_reviewed_by uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_review_remark text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_approval_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_approved_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_approved_by uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_approval_remark text DEFAULT NULL;
