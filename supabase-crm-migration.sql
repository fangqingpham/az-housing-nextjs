-- =============================================================
--  A-Z Housing CRM — Full Supabase Migration
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================


-- ── 1. Add 'admin' role to profiles ──────────────────────────
-- If your profiles table has a role column with a check constraint,
-- update it to include 'admin'. If it's just a text column, skip this.
-- Example (only run if you have an enum/check constraint):
--
-- ALTER TABLE profiles
--   DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles
--   ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('buyer', 'landlord', 'agent', 'admin'));


-- ── 2. deals table (Pipeline page) ───────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now(),
  client_name      TEXT        NOT NULL,
  client_email     TEXT,
  client_phone     TEXT,
  property_address TEXT        NOT NULL,
  deal_type        TEXT        DEFAULT 'buy'  CHECK (deal_type IN ('buy', 'rent', 'sell')),
  value            NUMERIC,
  stage            TEXT        DEFAULT 'lead' CHECK (stage IN ('lead','contacted','viewing','offer','closed','lost')),
  notes            TEXT,
  assigned_agent   TEXT
);

-- RLS for deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Admin full access (uses service role — no policy needed for service role)
-- If you also want to allow authenticated admins via the anon key, add:
CREATE POLICY "Admin full access to deals"
  ON deals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );


-- ── 3. transactions table (Finances page) ────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now(),
  date             DATE        NOT NULL,
  description      TEXT        NOT NULL,
  amount           NUMERIC     NOT NULL,
  type             TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  category         TEXT        NOT NULL,
  notes            TEXT,
  client_name      TEXT,
  property_address TEXT
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );


-- ── 4. site_settings table (Settings page) ───────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Seed default values (safe to re-run — upserts)
INSERT INTO site_settings (key, value) VALUES
  ('hero',     'Find Your Perfect Home Across Canada'),
  ('herosub',  'Browse thousands of listings from trusted sellers and agents across Canada.')
ON CONFLICT (key) DO NOTHING;

-- RLS: only service role needs access (API route uses SUPABASE_SERVICE_ROLE_KEY)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policy — the API route bypasses RLS via service role.
-- If you want admin users to read settings via the browser client directly, add:
-- CREATE POLICY "Admin read settings"
--   ON site_settings FOR SELECT
--   USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ── 5. Promote your account to admin ─────────────────────────
-- Replace the email below with your actual admin email, then run.
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
);

-- Verify:
-- SELECT id, email, role FROM profiles
-- JOIN auth.users ON profiles.id = auth.users.id
-- WHERE profiles.role = 'admin';
