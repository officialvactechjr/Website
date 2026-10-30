-- ---------------------------------------------------------------------------
-- 0012 — public_site_stats: the numbers Home's stats row shows, in one row.
--
-- WHY THIS IS SAFE TO EXPOSE TO anon, line by line:
--   1. It selects **aggregates only** — three counts. No id, full_name, email,
--      phone, role, class, section, is_active or any other row-level column is
--      selected or returned, so a visitor reading it learns totals and never
--      anything about a person. Nothing else is readable through it.
--   2. Every filter lives **inside the view**. The client cannot widen the
--      query, change a status, or ask for a different slice: it can read the
--      three numbers or nothing at all.
--   3. It deliberately keeps Postgres' default for a view, `security_invoker
--      = off`, so it runs with the view owner's rights. That is the whole point:
--      a visitor has no `select` on `profiles`, `projects` or `events`, so a
--      caller-rights view would apply RLS to those tables and silently return
--      0 — which is exactly the bug this migration exists to fix. Owner rights
--      let it COUNT rows the visitor may not read, while still showing only the
--      count.
--   4. Nothing else is granted. `select` on this one view, to `anon` and
--      `authenticated`. No table, function, column or other view is touched.
--
-- The fourth number Home shows — the club's committee count — has no table or
-- setting behind it (there is no `committees` table anywhere in the schema), so
-- it stays a single named constant in `src/lib/constants.js` (`COMMITTEE_COUNT`)
-- rather than being copied into SQL. Three real counts here, one constant there,
-- nothing duplicated.
--
-- Counters, and how each matches the public pages:
--   * members_count  — `public_members` is active members only (0009), so this
--                      counts `role = 'member' and is_active`. Staff and
--                      deactivated accounts are not members.
--   * projects_count — `public_projects` is approved only (0004).
--   * events_count   — published events that have already **finished**, using
--                      the end time when there is one and the start time
--                      otherwise. Drafts, cancelled events and anything still
--                      in the future are not "hosted" yet.
-- ---------------------------------------------------------------------------
create or replace view public.public_site_stats as
select
  (select count(*) from public.profiles
    where role = 'member' and is_active)             as members_count,
  (select count(*) from public.projects
    where status = 'approved')                       as projects_count,
  (select count(*) from public.events
    where status = 'published'
      and coalesce(ends_at, starts_at) <= now())     as events_count;

grant select on public.public_site_stats to anon, authenticated;

comment on view public.public_site_stats is
  'Home stats: active members, approved projects, published events already finished. Aggregates only, filters inside the view — safe to expose to anon.';
