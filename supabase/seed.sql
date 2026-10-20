-- seed.sql — development only, safe to run more than once.
-- Every row below is made up. No real students, no real dates, no real contact
-- details. Each block inserts only when its table is still empty.

insert into public.notices (title, body, is_pinned, published_at)
select v.title, v.body, v.is_pinned, v.published_at
from (
  values
    (
      'Membership registration is open',
      'Fill in the form on the Join page before the window closes. After approval the club team gives you an email and password.',
      true,
      now() - interval '2 days'
    ),
    (
      'Workshop: bring your laptop',
      'This week''s web development workshop is in the computer lab after the last period. Bring a laptop if you have one; we have a few to share.',
      false,
      now() - interval '5 days'
    ),
    (
      'Project uploads need approval',
      'Members can upload projects at any time. Each one is reviewed by the club team before it appears on the public projects page.',
      false,
      now() - interval '12 days'
    ),
    (
      'Club meeting moved to Friday',
      'Same room, same time, just a day later than usual.',
      false,
      now() - interval '20 days'
    )
) as v(title, body, is_pinned, published_at)
where not exists (select 1 from public.notices);

insert into public.events (title, description, location, starts_at, ends_at, status)
select v.title, v.description, v.location, v.starts_at, v.ends_at, v.status
from (
  values
    (
      'Intro to Web Development',
      'Workshop. HTML, CSS and your first page online.',
      'Computer lab',
      now() + interval '10 days',
      now() + interval '10 days 2 hours',
      'published'
    ),
    (
      'Inter-class Coding Quiz',
      'Teams of three, one question set, one winner.',
      'Hall',
      now() + interval '24 days',
      now() + interval '24 days 3 hours',
      'published'
    ),
    (
      'Git and GitHub for Beginners',
      'Workshop. Registration opens a week before.',
      'Computer lab',
      now() + interval '38 days',
      null,
      'published'
    ),
    (
      'Club orientation',
      'A short welcome for new members.',
      'Room 12',
      now() - interval '21 days',
      null,
      'published'
    ),
    (
      'Python basics workshop',
      'Variables, loops and a tiny script.',
      'Computer lab',
      now() - interval '48 days',
      null,
      'published'
    )
) as v(title, description, location, starts_at, ends_at, status)
where not exists (select 1 from public.events);

insert into public.settings (key, value)
select v.key, to_jsonb(v.value)
from (
  values
    ('site_name', 'VAC-TECH Jr.'),
    ('location', 'Vishwa Adarsha Academy, +2 section')
) as v(key, value)
where not exists (select 1 from public.settings);

-- ---------------------------------------------------------------------------
-- Showcase (migration 0004). All placeholder content: no real students, and the
-- images point at a public placeholder service. Replace both before launch.
-- ---------------------------------------------------------------------------
insert into public.bod_members (full_name, position, bio, photo_url, term_year, sort_order)
select v.full_name, v.position, v.bio, v.photo_url, v.term_year, v.sort_order
from (
  values
    ('Sample President', 'President', 'Placeholder bio. Replace with the real one.', 'https://placehold.co/600x600/0a1a3b/ffc349?text=President', '2026', 1),
    ('Sample Vice President', 'Vice President', 'Placeholder bio.', 'https://placehold.co/600x600/0a1a3b/1fd6f7?text=Vice+President', '2026', 2),
    ('Sample Secretary', 'Secretary', 'Placeholder bio.', 'https://placehold.co/600x600/0a1a3b/ffc349?text=Secretary', '2026', 3),
    ('Sample Treasurer', 'Treasurer', 'Placeholder bio.', 'https://placehold.co/600x600/0a1a3b/1fd6f7?text=Treasurer', '2026', 4),
    ('Sample IT Head', 'IT Head', 'Placeholder bio.', 'https://placehold.co/600x600/0a1a3b/ffc349?text=IT+Head', '2026', 5)
) as v(full_name, position, bio, photo_url, term_year, sort_order)
where not exists (select 1 from public.bod_members);

insert into public.gallery_photos (title, caption, image_url, taken_on, sort_order)
select v.title, v.caption, v.image_url, v.taken_on, v.sort_order
from (
  values
    ('Workshop in progress', 'Sample photo. Replace with a real one.', 'https://placehold.co/1200x900/0a1a3b/1fd6f7?text=Workshop', current_date - 20, 1),
    ('Club orientation', 'Sample photo.', 'https://placehold.co/1200x900/0a1a3b/ffc349?text=Orientation', current_date - 45, 2),
    ('Coding quiz', 'Sample photo.', 'https://placehold.co/1200x900/0a1a3b/1fd6f7?text=Quiz', current_date - 60, 3),
    ('Project showcase', 'Sample photo.', 'https://placehold.co/1200x900/0a1a3b/ffc349?text=Showcase', current_date - 90, 4)
) as v(title, caption, image_url, taken_on, sort_order)
where not exists (select 1 from public.gallery_photos);

-- Projects and points need an owner, and a profile can only exist for a real auth
-- user. Both blocks therefore insert nothing until a member account exists.
with owner as (
  select id from public.profiles where role = 'member' order by created_at limit 1
)
insert into public.projects (owner_id, title, description, image_url, github_url, status, review_note)
select o.id, v.title, v.description, v.image_url, v.github_url, v.status, v.review_note
from owner o,
  (
    values
      ('Library Book Tracker', 'Tracks which books are issued, who has them and when they are due back.', 'https://placehold.co/1280x720/0a1a3b/ffc349?text=Book+Tracker', 'https://github.com/example/library-book-tracker', 'approved', null),
      ('Exam Timetable Maker', 'Turns a list of subjects and dates into a clean timetable.', 'https://placehold.co/1280x720/0a1a3b/1fd6f7?text=Timetable', 'https://github.com/example/exam-timetable', 'approved', null),
      ('Quiz Buzzer', 'A buzzer screen for classroom quizzes. First tap wins.', 'https://placehold.co/1280x720/0a1a3b/ffc349?text=Quiz+Buzzer', 'https://github.com/example/quiz-buzzer', 'pending', null),
      ('Poster Maker', 'Makes posters from a template.', 'https://placehold.co/1280x720/0a1a3b/1fd6f7?text=Poster+Maker', 'https://github.com/example/poster-maker', 'rejected', 'Sample rejection note. The member would see this.')
  ) as v(title, description, image_url, github_url, status, review_note)
where not exists (select 1 from public.projects);

with owner as (
  select id from public.profiles where role = 'member' order by created_at limit 1
)
insert into public.points_log (member_id, points, reason)
select o.id, v.points, v.reason
from owner o,
  (
    values
      (50, 'Helped run a workshop'),
      (30, 'Project approved'),
      (20, 'Wrote a notice')
  ) as v(points, reason)
where not exists (select 1 from public.points_log);
