-- Create email_templates table
-- Columns:
-- id (uuid primary key), name, subject, body, created_at, updated_at, user_id (owner), is_public (optional)

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  is_public boolean NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);

-- Note: Add RLS policies separately if needed
