-- Security hardening: tenant-bound OWNER claims, private signed-context functions,
-- and deny-by-default payment tables. This migration does not enable payment processing.
CREATE SCHEMA IF NOT EXISTS solvex_private;
CREATE TABLE IF NOT EXISTS solvex_private.auth_secrets (
  secret_name text PRIMARY KEY,
  secret_value text NOT NULL CHECK (length(secret_value) >= 32),
  rotated_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION solvex_private.current_claims()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'solvex_private'
AS $function$
DECLARE
  token text; encoded_claims text; supplied_signature text; signing_secret text;
  claims jsonb; expected_signature text; issued_ms numeric; expires_ms numeric; current_ms numeric;
BEGIN
  token := current_setting('app.auth_token', true);
  IF token IS NULL OR length(token) > 8192 OR length(token) < 16 THEN RETURN NULL; END IF;
  IF length(token) - length(replace(token, '.', '')) <> 1 THEN RETURN NULL; END IF;
  encoded_claims := split_part(token, '.', 1);
  supplied_signature := split_part(token, '.', 2);
  SELECT secret_value INTO signing_secret FROM solvex_private.auth_secrets
    WHERE secret_name = 'SOLVEX_AUTH_SECRET';
  IF signing_secret IS NULL THEN RETURN NULL; END IF;
  expected_signature := encode(public.digest(convert_to(encoded_claims || ':' || signing_secret, 'UTF8'), 'sha256'), 'hex');
  IF supplied_signature <> expected_signature THEN RETURN NULL; END IF;
  BEGIN
    claims := convert_from(decode(encoded_claims, 'base64'), 'UTF8')::jsonb;
    issued_ms := (claims->>'issued_at')::numeric;
    expires_ms := (claims->>'expires_at')::numeric;
    current_ms := extract(epoch FROM clock_timestamp()) * 1000;
  EXCEPTION WHEN OTHERS THEN RETURN NULL;
  END;
  IF coalesce(claims->>'user_id', '') = '' OR
     coalesce(claims->>'tenant_id', '') = '' OR
     coalesce(claims->>'email', '') = '' OR
     claims->>'role' NOT IN ('OWNER', 'ADMIN', 'VERIFIER', 'CUSTOMER') OR
     issued_ms > current_ms + 30000 OR expires_ms <= current_ms OR
     expires_ms <= issued_ms OR expires_ms - issued_ms > 900000 THEN RETURN NULL; END IF;
  RETURN claims;
END
$function$;
CREATE OR REPLACE FUNCTION solvex_private.auth_context_ready()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'solvex_private'
AS $function$ SELECT EXISTS (SELECT 1 FROM solvex_private.auth_secrets WHERE secret_name = 'SOLVEX_AUTH_SECRET' AND length(secret_value) >= 32) $function$;
REVOKE ALL ON SCHEMA solvex_private FROM PUBLIC;
REVOKE ALL ON TABLE solvex_private.auth_secrets FROM PUBLIC;
REVOKE ALL ON FUNCTION solvex_private.current_claims() FROM PUBLIC;
REVOKE ALL ON FUNCTION solvex_private.auth_context_ready() FROM PUBLIC;
DO $migration$
DECLARE
  p record;
  table_name text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'ALL'
      AND policyname IN ('solvex_signed_tenant_context', 'solvex_tenant_access')
      AND (coalesce(qual, '') ILIKE '%OWNER%' OR coalesce(with_check, '') ILIKE '%OWNER%')
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I USING (tenant_id = (solvex_private.current_claims() ->> ''tenant_id''::text)) WITH CHECK (tenant_id = (solvex_private.current_claims() ->> ''tenant_id''::text))',
      p.policyname, p.schemaname, p.tablename
    );
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY[
    'payments', 'payment_events', 'payment_orders', 'payment_refunds', 'payment_fulfillments'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC', table_name);

      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'solvex_app_runtime') THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM solvex_app_runtime', table_name);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'solvex_runtime_login_v2') THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM solvex_runtime_login_v2', table_name);
      END IF;

      IF table_name <> 'payments'
         AND NOT EXISTS (
           SELECT 1 FROM pg_policies
           WHERE schemaname = 'public'
             AND tablename = table_name
             AND policyname = 'solvex_payment_default_deny'
         ) THEN
        EXECUTE format(
          'CREATE POLICY solvex_payment_default_deny ON public.%I FOR ALL TO PUBLIC USING (false) WITH CHECK (false)',
          table_name
        );
      END IF;
    END IF;
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'solvex_app_runtime') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA solvex_private TO solvex_app_runtime';
    EXECUTE 'GRANT EXECUTE ON FUNCTION solvex_private.current_claims() TO solvex_app_runtime';
    EXECUTE 'GRANT EXECUTE ON FUNCTION solvex_private.auth_context_ready() TO solvex_app_runtime';
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE solvex_private.auth_secrets FROM solvex_app_runtime';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'solvex_runtime_login_v2') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE solvex_private.auth_secrets FROM solvex_runtime_login_v2';
  END IF;
END
$migration$;
