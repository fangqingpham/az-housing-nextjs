-- ================================================================
-- A-Z Housing Referral Partner Program
-- Run this in Supabase SQL Editor before enabling the public forms.
-- ================================================================

create table if not exists referral_partners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  etransfer_email text not null,
  city text,
  province text,
  partner_background text,
  partner_type text not null default 'referral_partner',
  referral_id text not null unique,
  partner_status text not null default 'active',
  referral_terms_accepted_at timestamptz,
  referral_terms_version text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_referral_partners_email
  on referral_partners (lower(email));
create index if not exists idx_referral_partners_status
  on referral_partners (partner_status);

create table if not exists referral_submissions (
  id uuid primary key default gen_random_uuid(),
  referral_partner_user_id uuid,
  referral_partner_id uuid references referral_partners(id) on delete set null,
  referral_id text not null,
  partner_name text,
  partner_email text,
  partner_phone text,
  landlord_name text not null,
  landlord_email text not null,
  landlord_phone text not null,
  property_address text,
  city text,
  interested_services text[],
  notes text,
  consent_confirmed boolean default false,
  partner_rule_confirmed boolean default false,
  possible_duplicate boolean default false,
  duplicate_reason text,
  status text default 'submitted',
  created_client_case_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_referral_submissions_partner
  on referral_submissions(referral_partner_id);
create index if not exists idx_referral_submissions_referral_id
  on referral_submissions(referral_id);
create index if not exists idx_referral_submissions_landlord_email
  on referral_submissions(lower(landlord_email));

alter table client_cases
  add column if not exists referral_submission_id uuid,
  add column if not exists referral_partner_user_id uuid,
  add column if not exists referral_partner_id uuid,
  add column if not exists referral_id text,
  add column if not exists lead_source_detail text;

create index if not exists idx_client_cases_referral_submission
  on client_cases(referral_submission_id);
create index if not exists idx_client_cases_referral_partner
  on client_cases(referral_partner_id);
create index if not exists idx_client_cases_referral_id
  on client_cases(referral_id);

create table if not exists referral_payouts (
  id uuid primary key default gen_random_uuid(),
  referral_submission_id uuid references referral_submissions(id) on delete set null,
  referral_partner_user_id uuid,
  referral_partner_id uuid references referral_partners(id) on delete set null,
  client_case_id uuid,
  service_type text,
  eligible_fee numeric default 0,
  payout_amount numeric default 0,
  eligibility_status text default 'pending_requirements',
  payment_status text default 'not_payable',
  agreement_signed_at timestamptz,
  client_payment_received_at timestamptz,
  client_payment_cleared_at timestamptz,
  paid_at timestamptz,
  etransfer_email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_referral_payouts_partner
  on referral_payouts(referral_partner_id);
create index if not exists idx_referral_payouts_submission
  on referral_payouts(referral_submission_id);
create index if not exists idx_referral_payouts_status
  on referral_payouts(eligibility_status, payment_status);

create or replace function update_referral_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_referral_partners_updated_at on referral_partners;
create trigger trg_referral_partners_updated_at
  before update on referral_partners
  for each row execute function update_referral_updated_at();

drop trigger if exists trg_referral_submissions_updated_at on referral_submissions;
create trigger trg_referral_submissions_updated_at
  before update on referral_submissions
  for each row execute function update_referral_updated_at();

drop trigger if exists trg_referral_payouts_updated_at on referral_payouts;
create trigger trg_referral_payouts_updated_at
  before update on referral_payouts
  for each row execute function update_referral_updated_at();
