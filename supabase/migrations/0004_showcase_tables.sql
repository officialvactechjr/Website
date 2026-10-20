-- 0004_showcase_tables.sql
-- The showcase: board of directors, gallery, member projects, points.
--
-- HOW THE VIEWS ARE PROTECTED (read this before changing them)
-- ---------------------------------------------------------------------------
-- `public_members`, `public_projects` and `leaderboard` are plain views, which in
-- Postgres run with the rights of the role that owns them (the migration runner,
-- `postgres`). That role bypasses Row Level Security, so the WHERE clause INSIDE
-- each view is the entire security boundary. Each view therefore:
--   1. filters explicitly (active members only / approved projects only), and
--   2. selects only safe columns (never id, email, phone, role or is_active).
--
-- DO NOT add `with (security_invoker = true)` to these views. It looks safer, but
-- it makes the view obey the *caller's* RLS instead: a logged-out visitor has no
-- policy on `profiles`, so the pages would silently return nothing.
--
-- The raw tables stay closed: `projects` and `points_log` have no policy for
-- anonymous visitors or members, and `profiles` only lets a member read their own
-- row. People data reaches the public pages through the views and nowhere else.
--
-- Once applied, never edit this file: add a new numbered migration instead.

-- ---------------------------------------------------------------------------
-- Board of directors: photos, positions, short bios, by term year. (PUB-04)
-- ---------------------------------------------------------------------------
create table public.bod_members (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  position   text not null,
  bio        text,
  photo_url  text,
  term_year  text,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.bod_members enable row level security;

create policy "bod_members: anyone can read"
  on public.bod_members for select
  using (true);

-- `for all` covers select too, so staff need no separate read policy.
create policy "bod_members: staff can write"
  on public.bod_members for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Gallery photos. `event_id` is what the optional event filter on /gallery uses.
-- ---------------------------------------------------------------------------
create table public.gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  caption    text,
  image_url  text not null,
  taken_on   date,
  event_id   uuid references public.events (id) on delete set null,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.gallery_photos enable row level security;

create policy "gallery_photos: anyone can read"
  on public.gallery_photos for select
  using (true);

create policy "gallery_photos: staff can write"
  on public.gallery_photos for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Member projects. A project starts as `pending` and only `approved` rows are
-- public (through `public_projects` below). Points live in `points_log`.
--
-- No policy here lets a member write: their own upload/edit policies arrive with
-- migration 0006, together with the review flow.
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  image_url   text,
  github_url  text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_status_idx on public.projects (status);

alter table public.projects enable row level security;

create policy "projects: staff only"
  on public.projects for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Points log: one row per award. The leaderboard view sums it.
-- ---------------------------------------------------------------------------
create table public.points_log (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.profiles (id) on delete cascade,
  points     int not null,
  reason     text,
  given_by   uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index points_log_member_idx on public.points_log (member_id);

alter table public.points_log enable row level security;

create policy "points_log: staff only"
  on public.points_log for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- public_members — safe people columns for ACTIVE members only. (PUB-08)
-- Filter: `is_active`. Columns: no email, no phone, no role, no is_active.
-- ---------------------------------------------------------------------------
create view public.public_members as
select
  p.full_name,
  p."class",
  p.section,
  p.github_url,
  p.avatar_url
from public.profiles p
where p.is_active;

-- ---------------------------------------------------------------------------
-- public_projects — APPROVED projects only, with the owner's safe columns.
-- Filter: `status = 'approved'`. Columns: no email, no phone, no role.
-- ---------------------------------------------------------------------------
create view public.public_projects as
select
  pr.id,
  pr.title,
  pr.description,
  pr.image_url,
  pr.github_url,
  pr.created_at,
  p.full_name  as owner_name,
  p."class"    as owner_class,
  p.section    as owner_section,
  p.github_url as owner_github
from public.projects pr
join public.profiles p on p.id = pr.owner_id
where pr.status = 'approved';

-- ---------------------------------------------------------------------------
-- leaderboard — total points per active member, highest first. (PUB-07)
-- Filter: `is_active`, and only members who have actually scored, so the ranking
-- does not fill up with zeroes. Columns: name, class, total — nothing else.
-- ---------------------------------------------------------------------------
create view public.leaderboard as
select
  p.full_name,
  p."class",
  sum(pl.points) as total_points
from public.profiles p
join public.points_log pl on pl.member_id = p.id
where p.is_active
-- grouped by the id so two members with the same name stay separate, but the id
-- itself is not exposed.
group by p.id, p.full_name, p."class"
having sum(pl.points) > 0
order by sum(pl.points) desc, p.full_name;

-- The views must be readable by visitors. Supabase grants this by default, but
-- stating it here means the pages never depend on that default being in place.
grant select on public.public_members to anon, authenticated;
grant select on public.public_projects to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets. Public read; writes are staff-only until the member upload
-- flows arrive in migration 0006. Images only, 2 MB each.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',        'gallery',        true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('bod-photos',     'bod-photos',     true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-images', 'project-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars',        'avatars',        true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "gallery bucket: staff can write"
  on storage.objects for all to authenticated
  using (bucket_id = 'gallery' and public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (bucket_id = 'gallery' and public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "bod-photos bucket: staff can write"
  on storage.objects for all to authenticated
  using (bucket_id = 'bod-photos' and public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (bucket_id = 'bod-photos' and public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "project-images bucket: staff can write"
  on storage.objects for all to authenticated
  using (bucket_id = 'project-images' and public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (bucket_id = 'project-images' and public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "avatars bucket: staff can write"
  on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (bucket_id = 'avatars' and public.current_role() in ('manager', 'admin', 'super_admin'));
