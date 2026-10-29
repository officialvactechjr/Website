-- check-migrations.sql
-- Read-only. Answers "which migrations actually ran?" — because SQL pasted into
-- the editor by hand leaves no history row anywhere, the only reliable signal is
-- whether the objects each file creates are present.
--
-- Run the whole thing in the Supabase SQL editor. Nothing here changes data.

-- ---------------------------------------------------------------------------
-- 1. Verdict per migration. `applied` is true only when every object that file
--    creates exists. A false row means that file (or part of it) never ran.
-- ---------------------------------------------------------------------------
select migration, applied
from (
  values
    ('0001 profiles + user_role + current_role()',
      (to_regclass('public.profiles') is not null)
      and (to_regtype('public.user_role') is not null)
      and exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'current_role')),

    ('0002 notices + events + settings',
      (to_regclass('public.notices') is not null)
      and (to_regclass('public.events') is not null)
      and (to_regclass('public.settings') is not null)),

    ('0003 profile column guard (name/class/section)',
      exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'protect_profile_columns'
                and pg_get_functiondef(p.oid) like '%Only an admin can change a name%')),

    ('0004 showcase + 3 views + 4 buckets',
      (to_regclass('public.bod_members') is not null)
      and (to_regclass('public.gallery_photos') is not null)
      and (to_regclass('public.projects') is not null)
      and (to_regclass('public.points_log') is not null)
      and (to_regclass('public.public_members') is not null)
      and (to_regclass('public.public_projects') is not null)
      and (to_regclass('public.leaderboard') is not null)
      and (select count(*) from storage.buckets
             where id in ('gallery', 'bod-photos', 'project-images', 'avatars')) = 4),

    ('0005 registrations + 3 window helpers',
      (to_regclass('public.membership_windows') is not null)
      and (to_regclass('public.membership_applications') is not null)
      and (to_regclass('public.registration_forms') is not null)
      and (to_regclass('public.event_registrations') is not null)
      and (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public'
               and p.proname in ('membership_window_is_open', 'registration_is_open',
                                 'registration_form_fields_locked')) = 3),

    ('0006 projects + profile requests + email/phone',
      (to_regclass('public.profile_change_requests') is not null)
      and (to_regclass('public.staff_projects') is not null)
      and exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'profiles' and column_name = 'email')
      and exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone')),

    ('0007 points / suggestions / email log',
      (to_regclass('public.suggestions') is not null)
      and (to_regclass('public.email_log') is not null))
) as t(migration, applied)
order by migration;

-- ---------------------------------------------------------------------------
-- 2. Is the seed's fake content still there? (Counts, not verdicts.)
-- ---------------------------------------------------------------------------
select 'notices' as tbl, count(*) from public.notices
union all select 'events', count(*) from public.events
union all select 'bod_members', count(*) from public.bod_members
union all select 'gallery_photos', count(*) from public.gallery_photos
union all select 'projects', count(*) from public.projects
union all select 'points_log', count(*) from public.points_log;
-- The seed put 4 / 5 / 5 / 4 / 4 / 3 rows in those, in that order.

-- ---------------------------------------------------------------------------
-- 3. Full inventory, for anything the verdicts above do not name.
--    Compare against the object list in docs/ARCHITECTURE.md section 10.
-- ---------------------------------------------------------------------------
select 'table' as kind, table_name as name from information_schema.tables
 where table_schema = 'public'
union all select 'view', table_name from information_schema.views
 where table_schema = 'public'
union all select 'function', p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
union all select 'trigger', tgname from pg_trigger where not tgisinternal
union all select 'bucket', id from storage.buckets
union all select 'policy', policyname from pg_policies where schemaname in ('public', 'storage')
order by kind, name;
