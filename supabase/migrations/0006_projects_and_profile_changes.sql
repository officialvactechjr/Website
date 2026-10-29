-- 0006_projects_and_profile_changes.sql
-- Members own their projects, and profile edits that need approval travel through
-- a request table instead of being written directly.
--
-- Also here: `profiles` gains `email` and `phone`, and only admins can read other
-- people's rows. Managers keep every content screen but lose account data.
--
-- NOTE ON RATE LIMITS: migration 0005's public insert policies check *when* a row
-- may be inserted, never *how many*, and the join forms' honeypot is client-side
-- only. While a window is open a script can still post unlimited rows. Cloudflare
-- Turnstile is the intended fix when bots appear; a row cap is not, because a
-- flood would fill the cap and lock out real students.
--
-- Once applied, never edit this file: add a new numbered migration instead.

-- ---------------------------------------------------------------------------
-- profiles: private contact columns, plus a stricter read policy.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists email text check (char_length(email) <= 160),
  add column if not exists phone text check (char_length(phone) <= 30);

-- Mirror the login address so staff screens can show it without the auth schema.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Managers run content, not accounts: no more reading other people's rows.
drop policy "profiles: staff read all" on public.profiles;

create policy "profiles: admins read all"
  on public.profiles for select
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- The column guard, replaced: email and phone now move only through an approved
-- request and the service role, for every role that carries a user JWT.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.user_role := public.current_role();
begin
  -- service role, the SQL editor and migrations have no auth.uid()
  if auth.uid() is null then
    return new;
  end if;

  -- Even an admin cannot move these two by hand: the login address lives in
  -- auth.users, and only apply-profile-change may touch both halves.
  if new.email is distinct from old.email or new.phone is distinct from old.phone then
    raise exception 'Email and phone change only through an approved request';
  end if;

  if actor = 'super_admin' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only a super admin can change a role';
  end if;

  if new.is_active is distinct from old.is_active and actor <> 'admin' then
    raise exception 'Only an admin can change account status';
  end if;

  if
    actor <> 'admin'
    and (
      new.full_name is distinct from old.full_name
      or new."class" is distinct from old."class"
      or new.section is distinct from old.section
    )
  then
    raise exception 'Only an admin can change a name, class or section';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects: a member owns their rows. Staff already hold a `for all` policy from
-- migration 0004, and policies are combined with OR.
-- ---------------------------------------------------------------------------
create policy "projects: owner reads own"
  on public.projects for select
  to authenticated
  using (owner_id = auth.uid());

create policy "projects: owner inserts own"
  on public.projects for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and review_note is null
  );

create policy "projects: owner updates own"
  on public.projects for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "projects: owner deletes own"
  on public.projects for delete
  to authenticated
  using (owner_id = auth.uid());

-- The review columns belong to staff. A member's edit always sends the project
-- back to `pending`, whatever it was before.
create or replace function public.protect_project_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.user_role := public.current_role();
begin
  if auth.uid() is null then
    return new;
  end if;

  if actor in ('manager', 'admin', 'super_admin') then
    if new.status = 'rejected' and coalesce(btrim(new.review_note), '') = '' then
      raise exception 'A rejected project needs a reason in review_note';
    end if;
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.review_note := old.review_note;
  new.reviewed_by := old.reviewed_by;
  new.reviewed_at := old.reviewed_at;
  new.status := 'pending';
  return new;
end;
$$;

create trigger projects_protect_review_columns
  before update on public.projects
  for each row execute function public.protect_project_review_columns();

-- ---------------------------------------------------------------------------
-- Storage: a member writes only inside their own `{userId}/` folder. The staff
-- policies from 0004 still apply on top, and the other two buckets stay shut to
-- members because their 0004 policies name staff roles only.
-- ---------------------------------------------------------------------------
create policy "project-images: owner writes own folder"
  on storage.objects for all to authenticated
  using (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: owner writes own folder"
  on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- profile_change_requests: what a member cannot write directly, they request.
-- ---------------------------------------------------------------------------
create table public.profile_change_requests (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles (id) on delete cascade,
  field       text not null check (field in ('email', 'phone', 'full_name', 'class', 'section')),
  old_value   text check (char_length(old_value) <= 160),
  new_value   text not null check (char_length(new_value) between 1 and 160),
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  review_note text check (char_length(review_note) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One open request per field per member: no pile-ups, and no spam.
create unique index profile_change_requests_one_pending
  on public.profile_change_requests (member_id, field)
  where status = 'pending';

create index profile_change_requests_status_idx on public.profile_change_requests (status);

alter table public.profile_change_requests enable row level security;

create policy "profile_change_requests: members create their own"
  on public.profile_change_requests for insert
  to authenticated
  with check (member_id = auth.uid() and status = 'pending' and reviewed_by is null);

create policy "profile_change_requests: members read their own"
  on public.profile_change_requests for select
  to authenticated
  using (member_id = auth.uid());

-- Admins review them; managers do not handle account data.
create policy "profile_change_requests: admins read all"
  on public.profile_change_requests for select
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));

create policy "profile_change_requests: admins decide"
  on public.profile_change_requests for update
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'))
  with check (public.current_role() in ('admin', 'super_admin'));

-- No delete policy anywhere: a decided request is history, not clutter.

-- ---------------------------------------------------------------------------
-- staff_projects: the review queue, owner name and class included.
-- `profiles` is admin-only now, so managers need their own way in — and a plain
-- view runs with its owner's rights, so the WHERE inside it is the gate: a
-- visitor or a member gets no rows at all.
-- ---------------------------------------------------------------------------
create view public.staff_projects as
select
  pr.id,
  pr.owner_id,
  pr.title,
  pr.description,
  pr.image_url,
  pr.github_url,
  pr.status,
  pr.review_note,
  pr.reviewed_by,
  pr.reviewed_at,
  pr.created_at,
  p.full_name as owner_name,
  p."class"   as owner_class,
  p.section   as owner_section
from public.projects pr
join public.profiles p on p.id = pr.owner_id
where public.current_role() in ('manager', 'admin', 'super_admin');

grant select on public.staff_projects to authenticated;
