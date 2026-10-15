-- Forward-only compatibility repair for databases where 0003_recovery.sql
-- was already recorded in _migrations before its target_id additions existed.
-- Safe to rerun: every column and index is guarded by IF NOT EXISTS.
-- Keep target_id nullable here: existing rows may not have a reliable target
-- identifier, and inventing one would corrupt recovery/audit semantics.

ALTER TABLE IF EXISTS public.checkpoints
  ADD COLUMN IF NOT EXISTS target_id text;

ALTER TABLE IF EXISTS public.failures
  ADD COLUMN IF NOT EXISTS target_id text;

ALTER TABLE IF EXISTS public.rollback_records
  ADD COLUMN IF NOT EXISTS target_id text;

CREATE INDEX IF NOT EXISTS checkpoints_target_idx
  ON public.checkpoints (target_id, created_at);

CREATE INDEX IF NOT EXISTS failures_target_idx
  ON public.failures (target_id, created_at);

CREATE INDEX IF NOT EXISTS rollbacks_target_idx
  ON public.rollback_records (target_id, created_at);
