-- Add missing columns to withdrawal_requests for the new billing/withdrawal system
-- These columns may already exist if the user ran manual SQL, hence the IF NOT EXISTS guards

-- Add withdrawal_method (new standardized method field)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='withdrawal_method') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN withdrawal_method text;
  END IF;
END $$;

-- Add billing_profile_id (FK to billing_profiles)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='billing_profile_id') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN billing_profile_id uuid;
  END IF;
END $$;

-- Add fee_cents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='fee_cents') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN fee_cents integer DEFAULT 0;
  END IF;
END $$;

-- Add net_amount_cents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='net_amount_cents') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN net_amount_cents integer;
  END IF;
END $$;

-- Add payment_reference
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='payment_reference') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN payment_reference text;
  END IF;
END $$;

-- Add failure_reason
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='failure_reason') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN failure_reason text;
  END IF;
END $$;

-- Add rejection_reason
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='withdrawal_requests' AND column_name='rejection_reason') THEN
    ALTER TABLE public.withdrawal_requests ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Create Foreign Key from withdrawal_requests to billing_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'withdrawal_requests_billing_profile_id_fkey' 
    AND table_name = 'withdrawal_requests') THEN
    ALTER TABLE public.withdrawal_requests 
      ADD CONSTRAINT withdrawal_requests_billing_profile_id_fkey 
      FOREIGN KEY (billing_profile_id) REFERENCES public.billing_profiles(id);
  END IF;
END $$;

-- Migrate legacy data: copy old 'method' to new 'withdrawal_method'
UPDATE public.withdrawal_requests 
SET withdrawal_method = method 
WHERE withdrawal_method IS NULL AND method IS NOT NULL;

-- Set default net_amount_cents from amount_usd for existing rows
UPDATE public.withdrawal_requests 
SET net_amount_cents = amount_usd 
WHERE net_amount_cents IS NULL;
