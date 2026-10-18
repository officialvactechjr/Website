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
