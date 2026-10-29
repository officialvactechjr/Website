-- 0009_accounts_and_audit.sql
-- Accounts brief, Step 4:
--
--   1. A member must have a class and a section; a staff account must not carry
--      them (they are already nullable, so only the rule is new).
--   2. `public_members` shows ONLY active members, never staff.
--   3. `audit_log` — an append-only record of every account action. It is empty
--      of secrets on purpose: a password is never written anywhere.
--
-- Nothing already applied is edited: `0004` stays the source of the view and this
-- file replaces it. Once applied, never edit this file: add a new migration.

-- ---------------------------------------------------------------------------
-- A member needs a class and a section. Added as NOT VALID so it never fails on
-- rows that predate it; new and updated rows are always checked.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add constraint profiles_member_needs_class
  check (
    role <> 'member'
    or (
      class is not null and char_length(class) between 1 and 40
      and section is not null and char_length(section) between 1 and 40
    )
  )
  not valid;

-- ---------------------------------------------------------------------------
-- public_members: active members only. Staff (manager, admin, super_admin) must
-- never appear on a public page, even if one somehow carried a class.
-- ---------------------------------------------------------------------------
create or replace view public.public_members as
select
  p.full_name,
  p."class",
  p.section,
  p.github_url,
  p.avatar_url
from public.profiles p
where p.is_active
  and p.role = 'member';

grant select on public.public_members to anon, authenticated;

-- ---------------------------------------------------------------------------
-- audit_log — who did what to which account, and when.
-- Append-only: no insert, update or delete policy exists for any client role.
-- The service role (Edge Functions) writes it, bypassing RLS.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles (id) on delete set null,
  actor_role   public.user_role,
  action       text not null check (char_length(action) between 2 and 60),
  target_id    uuid,
  target_email text check (char_length(target_email) <= 160),
  detail       jsonb not null default '{}'::jsonb check (length(detail::text) <= 2000),
  created_at   timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Admin and Super Admin may read it. Nobody may write it from a client: the
-- appending is done by the service role inside the account functions.
create policy "audit_log: admins read"
  on public.audit_log for select
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));
