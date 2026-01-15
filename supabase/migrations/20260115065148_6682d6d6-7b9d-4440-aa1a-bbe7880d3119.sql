-- Add confirmation fields to reservations table
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS confirmation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS confirmation_method text,
ADD COLUMN IF NOT EXISTS confirmation_otp text,
ADD COLUMN IF NOT EXISTS confirmation_otp_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmation_token text,
ADD COLUMN IF NOT EXISTS confirmation_token_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Add index for confirmation token lookup
CREATE INDEX IF NOT EXISTS idx_reservations_confirmation_token ON public.reservations(confirmation_token) WHERE confirmation_token IS NOT NULL;