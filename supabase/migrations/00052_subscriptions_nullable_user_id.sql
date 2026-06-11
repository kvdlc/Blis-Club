-- Make user_id nullable on subscriptions so guest checkout can create
-- a subscription before the user account exists. The webhook will fill
-- in user_id after successful payment.
ALTER TABLE subscriptions ALTER COLUMN user_id DROP NOT NULL;