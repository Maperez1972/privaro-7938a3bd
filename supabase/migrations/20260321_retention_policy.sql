-- Add missing retention columns to org_settings
ALTER TABLE public.org_settings
  ADD COLUMN IF NOT EXISTS conversations_retention_days integer NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS pii_detections_retention_days integer NOT NULL DEFAULT 365;

-- Create retention_runs table
CREATE TABLE IF NOT EXISTS public.retention_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ran_at timestamptz NOT NULL DEFAULT now(),
  tokens_revoked integer NOT NULL DEFAULT 0,
  logs_anonymized integer NOT NULL DEFAULT 0,
  messages_deleted integer NOT NULL DEFAULT 0,
  pii_detections_deleted integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  error_message text
);

ALTER TABLE public.retention_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org retention runs"
  ON public.retention_runs FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_retention_runs_org_id ON public.retention_runs(org_id);
