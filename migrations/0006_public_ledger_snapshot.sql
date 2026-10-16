-- Read-only aggregate snapshot for the public operations dashboard.
-- SECURITY DEFINER is deliberately limited to aggregate counts and the most
-- recent audit hash; tenant-scoped rows are never returned to the caller.
CREATE SCHEMA IF NOT EXISTS solvex_private;

CREATE OR REPLACE FUNCTION solvex_private.public_ledger_snapshot()
RETURNS TABLE (
  paradoxes bigint,
  nodes bigint,
  offers bigint,
  published bigint,
  audit_height bigint,
  last_hash text,
  checkpoints bigint,
  failures bigint,
  rollbacks bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $function$
  SELECT
    (SELECT count(*) FROM public.paradoxes),
    (SELECT count(*) FROM public.node_registry),
    (SELECT count(*) FROM public.offers),
    (SELECT count(*) FROM public.offers WHERE published::text IN ('true', '1')),
    (SELECT count(*) FROM public.audit_records),
    (SELECT record_hash FROM public.audit_records ORDER BY index_num DESC LIMIT 1),
    (SELECT count(*) FROM public.checkpoints),
    (SELECT count(*) FROM public.failures),
    (SELECT count(*) FROM public.rollback_records);
$function$;

REVOKE ALL ON FUNCTION solvex_private.public_ledger_snapshot() FROM PUBLIC;

DO $grant$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'solvex_app_runtime') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA solvex_private TO solvex_app_runtime';
    EXECUTE 'GRANT EXECUTE ON FUNCTION solvex_private.public_ledger_snapshot() TO solvex_app_runtime';
  ELSE
    -- PGlite preview has no separate runtime role; expose only this aggregate.
    EXECUTE 'GRANT USAGE ON SCHEMA solvex_private TO PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION solvex_private.public_ledger_snapshot() TO PUBLIC';
  END IF;
END
$grant$;
