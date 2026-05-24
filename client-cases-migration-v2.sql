-- ================================================================
-- A-Z Housing CRM — Client Cases: add source_order_id link
-- Run this AFTER client-cases-migration.sql
-- ================================================================

-- Link client cases back to their originating tenant-placement order
ALTER TABLE client_cases
  ADD COLUMN IF NOT EXISTS source_order_id uuid;

CREATE INDEX IF NOT EXISTS idx_client_cases_source_order
  ON client_cases(source_order_id);
