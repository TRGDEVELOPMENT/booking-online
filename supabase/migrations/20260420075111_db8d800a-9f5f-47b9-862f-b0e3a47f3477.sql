ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS purchase_type text DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS down_payment numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS finance_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installment_period_id uuid;