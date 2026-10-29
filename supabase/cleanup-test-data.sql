-- cleanup-test-data.sql
-- Removes every fake row created by seed.sql and by the test snippets in
-- docs/TESTING.md, and nothing else. Run it in the Supabase SQL editor.
-- Safe to run twice: the patterns match nothing once the rows are gone.
--
-- This is NOT a migration. It changes data, not structure, so it does not belong
-- in supabase/migrations/. It leaves every table, bucket, policy and trigger alone.
--
-- Deliberately KEPT:
--   * public.settings        -- site_name and location are real club config, not samples
--   * the Super Admin        -- a real institution account, created by hand, not a test row
--   * auth schema, buckets, RLS policies, triggers, views
--
-- Deliberately NOT matched (edit the patterns if you created them):
--   * rows a tester typed through the UI with their own wording, e.g. a notice
--     called something other than the four seed titles below

begin;

-- ---------------------------------------------------------------------------
-- 1. PREVIEW. Read these counts before you commit. Nothing is deleted yet.
-- ---------------------------------------------------------------------------
select 'notices' as tbl, count(*) as rows_to_delete from public.notices
 where title in ('Membership registration is open', 'Workshop: bring your laptop',
                 'Project uploads need approval', 'Club meeting moved to Friday')
union all select 'events', count(*) from public.events
 where title in ('Intro to Web Development', 'Inter-class Coding Quiz', 'Git and GitHub for Beginners',
                 'Club orientation', 'Python basics workshop')
union all select 'bod_members', count(*) from public.bod_members
 where full_name like 'Sample %'
union all select 'gallery_photos', count(*) from public.gallery_photos
 where title in ('Workshop in progress', 'Club orientation', 'Coding quiz', 'Project showcase')
union all select 'projects', count(*) from public.projects
 where title in ('Library Book Tracker', 'Exam Timetable Maker', 'Quiz Buzzer', 'Poster Maker', 'Test project')
union all select 'points_log', count(*) from public.points_log
 where reason in ('Helped run a workshop', 'Project approved', 'Wrote a notice')
union all select 'membership_windows', count(*) from public.membership_windows
 where label = 'Sample window'
union all select 'profiles (test accounts)', count(*) from public.profiles
 where full_name like 'Test %' and email like '%@example.com' and role <> 'super_admin';

-- ---------------------------------------------------------------------------
-- 2. Content, children before parents.
--    membership_applications.window_id is ON DELETE RESTRICT, so applications
--    must go before their window. registration_forms cascades from events, but
--    is cleared explicitly so the order is obvious.
-- ---------------------------------------------------------------------------
delete from public.event_registrations
 where form_id in (
   select f.id from public.registration_forms f
   join public.events e on e.id = f.event_id
   where e.title in ('Intro to Web Development', 'Inter-class Coding Quiz',
                     'Git and GitHub for Beginners', 'Club orientation', 'Python basics workshop')
 );

delete from public.registration_forms
 where event_id in (
   select id from public.events
   where title in ('Intro to Web Development', 'Inter-class Coding Quiz',
                   'Git and GitHub for Beginners', 'Club orientation', 'Python basics workshop')
 );

delete from public.membership_applications
 where window_id in (select id from public.membership_windows where label = 'Sample window');

delete from public.membership_windows where label = 'Sample window';

delete from public.points_log
 where reason in ('Helped run a workshop', 'Project approved', 'Wrote a notice');

delete from public.projects
 where title in ('Library Book Tracker', 'Exam Timetable Maker', 'Quiz Buzzer', 'Poster Maker', 'Test project');

delete from public.gallery_photos
 where title in ('Workshop in progress', 'Club orientation', 'Coding quiz', 'Project showcase');

delete from public.bod_members where full_name like 'Sample %';

delete from public.notices
 where title in ('Membership registration is open', 'Workshop: bring your laptop',
                 'Project uploads need approval', 'Club meeting moved to Friday');

-- Events last: registration_forms and gallery_photos both point here.
delete from public.events
 where title in ('Intro to Web Development', 'Inter-class Coding Quiz', 'Git and GitHub for Beginners',
                 'Club orientation', 'Python basics workshop');

-- ---------------------------------------------------------------------------
-- 3. Test accounts. This is the only irreversible part of the script.
--    It removes the login in auth.users; the profile row, its projects, its
--    points and its change requests all cascade from there.
--    Narrow on purpose: "Test " AND @example.com must BOTH match, and a super
--    admin is never touched. If your test accounts differ, edit both patterns.
-- ---------------------------------------------------------------------------
delete from auth.users
 where id in (
   select id from public.profiles
   where full_name like 'Test %' and email like '%@example.com' and role <> 'super_admin'
 );

-- ---------------------------------------------------------------------------
-- 4. CONFIRM, then commit. Swap COMMIT for ROLLBACK to undo all of it.
--    Expect notices/events/bod_members/gallery_photos/projects to be empty,
--    membership_windows to be empty, and profiles to still hold the Super Admin.
-- ---------------------------------------------------------------------------
select 'notices' as tbl, count(*) from public.notices
union all select 'events', count(*) from public.events
union all select 'bod_members', count(*) from public.bod_members
union all select 'gallery_photos', count(*) from public.gallery_photos
union all select 'projects', count(*) from public.projects
union all select 'points_log', count(*) from public.points_log
union all select 'membership_windows', count(*) from public.membership_windows
union all select 'settings (kept on purpose)', count(*) from public.settings
union all select 'profiles (Super Admin must remain)', count(*) from public.profiles;

commit;
