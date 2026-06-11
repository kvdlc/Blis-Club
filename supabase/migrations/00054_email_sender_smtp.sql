-- Insert default SMTP sender for transactional emails
-- Table: email_senders (columns: id, name, provider, email, is_default, config)

-- First, set any existing default sender to non-default
UPDATE email_senders SET is_default = false WHERE is_default = true;

-- Insert the Asura Hosting SMTP configuration
INSERT INTO email_senders (name, provider, email, is_default, config)
VALUES (
  'Asura Hosting SMTP',
  'smtp',
  'hola@blis.club',
  true,
  '{"smtp_host": "c7.my-control-panel.com", "smtp_port": "465", "smtp_user": "hola@blis-corp.com", "smtp_pass": "fxj~(FuT+BpatQ8i"}'::jsonb
);