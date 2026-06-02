-- Create subscription_payments table to track each payment (initial + recurring)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'succeeded',
  payment_method text DEFAULT 'card',
  description text,
  izipay_transaction_id text,
  izipay_subscription_id text,
  metadata jsonb,
  commission_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_izipay_tx ON public.subscription_payments(izipay_transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_created_at ON public.subscription_payments(created_at);

-- Add subscription_payment_id to referral_commissions for tracking recurring commissions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='referral_commissions' AND column_name='subscription_payment_id') THEN
    ALTER TABLE public.referral_commissions ADD COLUMN subscription_payment_id uuid REFERENCES public.subscription_payments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index on new column
CREATE INDEX IF NOT EXISTS idx_referral_commissions_payment_id ON public.referral_commissions(subscription_payment_id);

-- Add billing_period info to referrals to track which period generated commission
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='referral_commissions' AND column_name='billing_period_start') THEN
    ALTER TABLE public.referral_commissions ADD COLUMN billing_period_start timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='referral_commissions' AND column_name='billing_period_end') THEN
    ALTER TABLE public.referral_commissions ADD COLUMN billing_period_end timestamptz;
  END IF;
END $$;
