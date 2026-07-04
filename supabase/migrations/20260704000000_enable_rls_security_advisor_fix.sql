-- Restrict sensitive CRM and referral tables to trusted server-side clients.
-- The service role bypasses RLS and therefore needs no policy.

alter table public.client_cases enable row level security;
alter table public.case_notes enable row level security;
alter table public.referral_partners enable row level security;
alter table public.referral_submissions enable row level security;
alter table public.referral_payouts enable row level security;

-- Remove legacy policies. With RLS enabled and no policies, anon and
-- authenticated browser clients have no access. Public referral writes and
-- staff CRM access go through validated server API routes.
do $migration$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'client_cases', 'case_notes', 'referral_partners',
        'referral_submissions', 'referral_payouts'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$migration$;

-- Authenticated admins may access these tables directly if needed. The app
-- currently uses authenticated API routes instead. Non-admin authenticated
-- users and anon receive no policy grant.
create policy "Admins can manage client cases"
  on public.client_cases for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

create policy "Admins can manage case notes"
  on public.case_notes for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

create policy "Admins can manage referral partners"
  on public.referral_partners for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

create policy "Admins can manage referral submissions"
  on public.referral_submissions for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

create policy "Admins can manage referral payouts"
  on public.referral_payouts for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

comment on table public.client_cases is 'RLS restricted; access is through authenticated server API routes using the service role.';
comment on table public.case_notes is 'RLS restricted; access is through authenticated server API routes using the service role.';
comment on table public.referral_partners is 'RLS restricted; signup uses a validated server API route and the service role.';
comment on table public.referral_submissions is 'RLS restricted; submission uses a validated server API route and the service role.';
comment on table public.referral_payouts is 'RLS restricted; access is through authenticated server API routes using the service role.';
