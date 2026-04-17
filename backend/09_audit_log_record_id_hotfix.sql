-- ==========================================
-- STEP 09: HOTFIX — audit_logs.record_id type drift
-- ==========================================
-- Some environments were initialized before Step 05 changed record_id to text.
-- This migration makes the column compatible with both UUID ids and text codes (e.g. accounts.id = '1001').

ALTER TABLE public.audit_logs
  ALTER COLUMN record_id TYPE text USING record_id::text;
