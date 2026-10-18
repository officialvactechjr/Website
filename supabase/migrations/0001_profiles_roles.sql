-- 0001_profiles_roles.sql
-- Profiles, roles and the helpers later migrations rely on.
-- Once applied, never edit this file: add a new numbered migration instead.
--
-- After applying: create the first Super Admin by hand. In the Supabase Auth
-- dashboard add a user (email + password, "Auto Confirm User" on), then insert
-- their profile row from the SQL editor:
--   insert into public.profiles (id, full_name, role, must_change_password)
--   values ('<auth-user-uuid>', 'Club Super Admin', 'super_admin', true);

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('member', 'manager', 'admin', 'super_admin');

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, holding everything the app needs about them.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text not null,
  class                text,
  section              text,
  github_url           text,
  avatar_url           text,
  role                 public.user_role not null default 'member',
  is_active            boolean not null default true,
  must_change_password boolean not null default true,
  created_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- current_role(): the caller's role, read from the database, never from the
-- client. SECURITY DEFINER so it does not re-enter the profiles RLS policies.
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: staff read all"
  on public.profiles for select
  using (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: admin update all"
  on public.profiles for update
  using (public.current_role() in ('admin', 'super_admin'))
  with check (public.current_role() in ('admin', 'super_admin'));

-- No insert or delete policies on purpose: profile rows are created by the
-- create-member Edge Function (service role, bypasses RLS) and deleted together
-- with the auth user through the cascade above.

-- ---------------------------------------------------------------------------
-- Column protection. A member may edit their own profile, but only a super
-- admin may change a role and only an admin may activate or deactivate.
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

  if actor = 'super_admin' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only a super admin can change a role';
  end if;

  if new.is_active is distinct from old.is_active and actor <> 'admin' then
    raise exception 'Only an admin can change account status';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();
