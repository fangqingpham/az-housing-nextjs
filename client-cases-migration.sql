-- ================================================================
-- A-Z Housing CRM — Client Cases Module
-- Run this in your Supabase SQL editor
-- ================================================================

-- 1. Sequence for auto-generated, race-condition-safe case numbers
CREATE SEQUENCE IF NOT EXISTS client_case_seq START 1;

-- 2. Main client_cases table
CREATE TABLE IF NOT EXISTS client_cases (
  id                      uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number             text            NOT NULL DEFAULT (
                            'AZ-' || to_char(now(), 'YYYY') || '-' ||
                            lpad(nextval('client_case_seq')::text, 4, '0')
                          ),
  full_name               text            NOT NULL,
  client_type             text            NOT NULL,
  phone                   text,
  email                   text,
  preferred_contact       text,
  language                text,
  lead_source             text,
  assigned_agent_id       uuid,
  status                  text            NOT NULL DEFAULT 'New',
  priority                text            NOT NULL DEFAULT 'Normal',
  property_address        text,
  unit                    text,
  city                    text,
  province                text,
  postal_code             text,
  property_type           text,
  rent_amount             numeric(12,2),
  purchase_price          numeric(12,2),
  sale_price              numeric(12,2),
  service_type            text,
  start_date              date,
  end_date                date,
  deadline                date,
  client_needs            text,
  current_situation       text,
  next_followup_date      date,
  next_action             text,
  last_contacted_date     date,
  related_landlord        text,
  related_tenant          text,
  related_buyer           text,
  related_seller          text,
  related_realtor         text,
  related_mortgage_agent  text,
  related_paralegal       text,
  checklist               jsonb           NOT NULL DEFAULT '{}',
  archived                boolean         NOT NULL DEFAULT false,
  created_at              timestamptz     DEFAULT now(),
  updated_at              timestamptz     DEFAULT now()
);

-- 3. Case notes table
CREATE TABLE IF NOT EXISTS case_notes (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id     uuid        NOT NULL REFERENCES client_cases(id) ON DELETE CASCADE,
  content     text        NOT NULL,
  created_by  text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_cases_agent   ON client_cases(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_client_cases_status  ON client_cases(status);
CREATE INDEX IF NOT EXISTS idx_client_cases_archived ON client_cases(archived);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id   ON case_notes(case_id);

-- 5. Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_client_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_client_cases_updated_at ON client_cases;
CREATE TRIGGER trg_client_cases_updated_at
  BEFORE UPDATE ON client_cases
  FOR EACH ROW EXECUTE FUNCTION update_client_cases_updated_at();
