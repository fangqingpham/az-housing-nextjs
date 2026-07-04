-- Public articles are readable by everyone, but only admins/server routes may mutate them.
alter table public.articles enable row level security;

do $migration$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'articles'
  loop
    execute format('drop policy if exists %I on public.articles', policy_record.policyname);
  end loop;
end
$migration$;

create policy "Published articles are publicly readable"
  on public.articles for select to public
  using (true);

create policy "Admins can manage articles"
  on public.articles for all to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

-- Public bucket is intentional: published cover URLs must remain stable and cacheable.
-- Uploads still require the service-role API; no public insert/update/delete policy exists.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-covers',
  'article-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read article covers" on storage.objects;
create policy "Public read article covers"
  on storage.objects for select to public
  using (bucket_id = 'article-covers');
