-- ---------------------------------------------------------------------------
-- 0013 — four indexes for the filters the app actually uses.
--
-- Every one of these backs a real query in `src/features/*/api.js` or a view;
-- nothing speculative is added. The tables already carry the single-column
-- indexes written with them in `0002`, `0004`, `0005` and `0007` — these are the
-- **composite** versions for the two-column filters those single ones cannot
-- serve. `if not exists` keeps the file safe to re-run.
--
-- Why they matter at club scale: `points_log` and `audit_log` only grow, and
-- every RLS policy adds a filter of its own on top of the one below, so a
-- sequential scan per admin list page gets slower every term.
-- ---------------------------------------------------------------------------

-- Public event lists filter status first, then order/range on starts_at:
--   events(status, starts_at)  — published future / published past.
create index if not exists events_status_starts_idx
  on public.events (status, starts_at desc);

-- `public_members` and the `public_site_stats` view both filter active members:
--   profiles(role, is_active)  — `where role = 'member' and is_active`.
create index if not exists profiles_role_active_idx
  on public.profiles (role, is_active);

-- The member portal lists one owner's projects, and both review views filter by
-- status: projects(owner_id, status) serves "my projects" and the review queue.
create index if not exists projects_owner_status_idx
  on public.projects (owner_id, status);

-- The applications screen opens one membership window and filters its status:
--   membership_applications(window_id, status).
create index if not exists applications_window_status_idx
  on public.membership_applications (window_id, status);
