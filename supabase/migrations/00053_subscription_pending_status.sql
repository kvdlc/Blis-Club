-- Add 'pending' to subscription_status enum so new subscriptions can be
-- created with status = 'pending' before payment is confirmed.
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'pending';