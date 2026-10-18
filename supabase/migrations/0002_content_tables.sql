-- 0002_content_tables.sql
-- Notices, events and site settings.
--
-- Read: everyone, with unreleased notices and event drafts held back by RLS (not
-- by the app). Staff read everything.
-- Write: staff only. A member has no policy on these tables, so any insert,
-- update or delete from a member account is refused by the database.
-- Once applied, never edit this file: add a new numbered migration instead.

-- ---------------------------------------------------------------------------
-- Notices. A notice becomes public once published_at has passed, so a
-- future-dated row can be prepared ahead of time.
-- ---------------------------------------------------------------------------
create table public.notices (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  is_pinned    boolean not null default false,
  published_at timestamptz not null default now(),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index notices_order_idx on public.notices (is_pinned desc, published_at desc);

alter table public.notices enable row level security;

create policy "notices: released notices are public"
  on public.notices for select
  using (published_at <= now());

create policy "notices: staff read all"
  on public.notices for select
  using (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "notices: staff write"
  on public.notices for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Events. `status` keeps a draft invisible until it is reviewed: only
-- 'published' and 'cancelled' are public, so a shared link to a cancelled
-- event still explains itself.
-- ---------------------------------------------------------------------------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  cover_image text,
  status      text not null default 'published'
                check (status in ('draft', 'published', 'cancelled')),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index events_starts_at_idx on public.events (starts_at desc);

alter table public.events enable row level security;

create policy "events: published or cancelled are public"
  on public.events for select
  using (status in ('published', 'cancelled'));

create policy "events: staff read all"
  on public.events for select
  using (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "events: staff write"
  on public.events for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Settings: key/value rows (site name, contact details, links).
--
-- THIS TABLE IS PUBLICLY READABLE. Never store a private value here: no API
-- keys, no secrets, no personal email address or phone number. Anything in this
-- table is visible to every visitor. Private values belong in Edge Function
-- secrets, or in a table with no public read policy.
--
-- Write access is deliberately narrower than the content tables: admin and
-- super_admin only (PRD SUP-02).
-- ---------------------------------------------------------------------------
create table public.settings (
  key   text primary key,
  value jsonb not null default 'null'::jsonb
);

alter table public.settings enable row level security;

create policy "settings: anyone can read"
  on public.settings for select
  using (true);

create policy "settings: admin can write"
  on public.settings for all
  using (public.current_role() in ('admin', 'super_admin'))
  with check (public.current_role() in ('admin', 'super_admin'));
