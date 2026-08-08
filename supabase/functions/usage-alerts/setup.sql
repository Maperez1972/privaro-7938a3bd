-- Ejecutar en Supabase (SQL Editor) antes de desplegar la función usage-alerts.
-- No es un fichero de migración gestionado: se aplica manualmente.

CREATE TABLE IF NOT EXISTS public.billing_usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_account_id uuid NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
  cycle_start date NOT NULL,
  threshold int NOT NULL,
  pct_at_send int NOT NULL,
  requests_used bigint NOT NULL,
  requests_limit bigint NOT NULL,
  recipients text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (billing_account_id, cycle_start, threshold)
);

GRANT ALL ON public.billing_usage_alerts TO service_role;
ALTER TABLE public.billing_usage_alerts ENABLE ROW LEVEL SECURITY;
-- Sin políticas para anon/authenticated: tabla puramente operativa,
-- solo la Edge Function (service_role) la usa.

-- Programación horaria (requiere pg_cron + pg_net):
-- SELECT cron.schedule(
--   'privaro-usage-alerts',
--   '0 * * * *',
--   $$
--     SELECT net.http_post(
--       url := 'https://<PROJECT_REF>.supabase.co/functions/v1/usage-alerts',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'X-Internal-Secret', '<INTERNAL_NOTIFY_SECRET>'
--       ),
--       body := '{}'::jsonb
--     );
--   $$
-- );
