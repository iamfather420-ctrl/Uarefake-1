-- Coordinated issuer/verifier migration: use HMAC-SHA-256, not a custom digest.
-- Existing tokens signed with the legacy digest intentionally stop verifying.
-- Production auth remains disabled until a matching secret is provisioned and
-- end-to-end tenant-isolation tests pass.
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
  IF supplied_signature !~ '^[0-9a-f]{64}$' THEN RETURN NULL; END IF;
  SELECT secret_value INTO signing_secret FROM solvex_private.auth_secrets
    WHERE secret_name = 'SOLVEX_AUTH_SECRET';
  IF signing_secret IS NULL OR length(signing_secret) < 32 THEN RETURN NULL; END IF;
  expected_signature := encode(
    public.hmac(convert_to(encoded_claims, 'UTF8'), convert_to(signing_secret, 'UTF8'), 'sha256'),
    'hex'
  );
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
