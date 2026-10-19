-- Prevent concurrent requests from creating multiple live jobs for one entitlement.
-- Fail visibly instead of silently choosing a winner if earlier data already violates
-- the invariant. FAILED/REVOKED jobs may be retried with a new job record.
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM fulfillment_jobs
    WHERE status NOT IN ('FAILED', 'REVOKED')
    GROUP BY entitlement_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one active fulfillment job per entitlement: duplicate active jobs exist; reconcile them before retrying';
  END IF;
END
$migration$;

CREATE UNIQUE INDEX IF NOT EXISTS fulfillment_jobs_one_active_per_entitlement
  ON fulfillment_jobs (entitlement_id)
  WHERE status NOT IN ('FAILED', 'REVOKED');
