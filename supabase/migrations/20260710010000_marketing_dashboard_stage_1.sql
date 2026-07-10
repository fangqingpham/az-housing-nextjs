create table if not exists public.marketing_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  occurred_at timestamptz not null default now(),
  page_path text,
  page_title text,
  service text,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  referrer text,
  session_identifier text,
  device_type text,
  related_order_id uuid,
  related_referral_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketing_events_occurred_at on public.marketing_events (occurred_at desc);
create index if not exists idx_marketing_events_event_name on public.marketing_events (event_name);
create index if not exists idx_marketing_events_campaign on public.marketing_events (campaign);
create index if not exists idx_marketing_events_source on public.marketing_events (source);
create index if not exists idx_marketing_events_page_path on public.marketing_events (page_path);
create index if not exists idx_marketing_events_related_order on public.marketing_events (related_order_id);

alter table public.marketing_events enable row level security;

drop policy if exists "Admins can read marketing events" on public.marketing_events;
create policy "Admins can read marketing events"
  on public.marketing_events for select to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

alter table public.messages
  add column if not exists gclid text,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists latest_touch_source text,
  add column if not exists latest_touch_medium text,
  add column if not exists latest_touch_campaign text;

alter table public.tenant_placement_orders
  add column if not exists gclid text,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists latest_touch_source text,
  add column if not exists latest_touch_medium text,
  add column if not exists latest_touch_campaign text;

alter table public.referral_partners
  add column if not exists gclid text,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists latest_touch_source text,
  add column if not exists latest_touch_medium text,
  add column if not exists latest_touch_campaign text;

alter table public.referral_submissions
  add column if not exists gclid text,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists latest_touch_source text,
  add column if not exists latest_touch_medium text,
  add column if not exists latest_touch_campaign text;

create index if not exists idx_messages_latest_touch_source on public.messages (latest_touch_source);
create index if not exists idx_tenant_orders_latest_touch_source on public.tenant_placement_orders (latest_touch_source);
create index if not exists idx_referral_partners_latest_touch_source on public.referral_partners (latest_touch_source);
create index if not exists idx_referral_submissions_latest_touch_source on public.referral_submissions (latest_touch_source);
