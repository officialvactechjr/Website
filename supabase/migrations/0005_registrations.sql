-- 0005_registrations.sql
-- Membership applications and event registration.
--
-- THE RULE FOR BOTH: a visitor may INSERT and may never SELECT.
-- Applications and event registrations carry an email address and a phone
-- number, so no policy lets anon or a member read a single row of either table.
-- That is why the frontend inserts WITHOUT `.select()` — asking for the row back
-- would need a read policy and would hand out other people's contact details.
--
-- The window is enforced in the database, not in the UI: the insert policy calls
-- a SECURITY DEFINER helper that re-checks the open window itself. Turning the
-- clock forward on the browser, or editing the page, changes nothing.
--
-- membership_windows and registration_forms are public on purpose: they hold
-- dates and question text only. Never put a private value in either.
--
-- Helpers are declared before the policies that call them, because Postgres
-- resolves a policy's expression when the policy is created.
--
-- Once applied, never edit this file: add a new numbered migration instead.

-- ---------------------------------------------------------------------------
-- Membership windows. `is_open` is the manual override on top of the dates.
-- ---------------------------------------------------------------------------
create table public.membership_windows (
  id         uuid primary key default gen_random_uuid(),
  label      text check (char_length(label) <= 60),
  opens_at   timestamptz not null,
  closes_at  timestamptz not null,
  is_open    boolean not null default true,
  created_at timestamptz not null default now(),
  check (closes_at > opens_at)
);

alter table public.membership_windows enable row level security;

create policy "membership_windows: anyone can read"
  on public.membership_windows for select
  using (true);

-- ADM-14: opening and closing membership is Admin or Super Admin only.
create policy "membership_windows: admin can write"
  on public.membership_windows for all
  using (public.current_role() in ('admin', 'super_admin'))
  with check (public.current_role() in ('admin', 'super_admin'));

create or replace function public.membership_window_is_open(p_window_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.membership_windows w
    where w.id = p_window_id
      and w.is_open
      and now() between w.opens_at and w.closes_at
  )
$$;

-- ---------------------------------------------------------------------------
-- Applications.
-- ---------------------------------------------------------------------------
create table public.membership_applications (
  id           uuid primary key default gen_random_uuid(),
  window_id    uuid not null references public.membership_windows (id) on delete restrict,
  full_name    text not null check (char_length(full_name) between 2 and 120),
  class        text check (char_length(class) <= 40),
  section      text check (char_length(section) <= 40),
  email        text not null check (char_length(email) between 5 and 160),
  phone        text check (char_length(phone) <= 30),
  reason       text check (char_length(reason) <= 1000),
  consent      boolean not null check (consent),
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz
);

-- One application per email per window, case-insensitive.
create unique index membership_applications_one_per_email
  on public.membership_applications (window_id, lower(email));

create index membership_applications_status_idx on public.membership_applications (status);

alter table public.membership_applications enable row level security;

create policy "membership_applications: anyone may apply while open"
  on public.membership_applications for insert
  to anon, authenticated
  with check (
    public.membership_window_is_open(window_id)
    and status = 'pending'
    and reviewed_by is null
  );

-- No read, update or delete policy for anon or members: staff only.
create policy "membership_applications: staff only"
  on public.membership_applications for all
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Event registration forms: one per event, holding the question list.
-- ---------------------------------------------------------------------------
create table public.registration_forms (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null unique references public.events (id) on delete cascade,
  fields     jsonb not null default '[]'::jsonb
               check (jsonb_typeof(fields) = 'array' and jsonb_array_length(fields) <= 25),
  opens_at   timestamptz not null,
  closes_at  timestamptz not null,
  created_at timestamptz not null default now(),
  check (closes_at > opens_at)
);

alter table public.registration_forms enable row level security;

create policy "registration_forms: anyone can read"
  on public.registration_forms for select
  using (true);

create policy "registration_forms: staff can write"
  on public.registration_forms for all
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- A form is open only while its own dates allow it AND the event is published.
create or replace function public.registration_is_open(p_form_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.registration_forms f
    join public.events e on e.id = f.event_id
    where f.id = p_form_id
      and e.status = 'published'
      and now() between f.opens_at and f.closes_at
  )
$$;

-- ---------------------------------------------------------------------------
-- Event registrations.
-- ---------------------------------------------------------------------------
create table public.event_registrations (
  id           uuid primary key default gen_random_uuid(),
  form_id      uuid not null references public.registration_forms (id) on delete cascade,
  full_name    text check (char_length(full_name) <= 120),
  email        text check (char_length(email) <= 160),
  answers      jsonb not null default '{}'::jsonb
                 check (jsonb_typeof(answers) = 'object' and length(answers::text) <= 16000),
  submitted_at timestamptz not null default now()
);

-- One registration per email per form. NULL emails stay distinct in Postgres, so
-- an event whose form does not ask for an email simply cannot de-duplicate.
create unique index event_registrations_one_per_email
  on public.event_registrations (form_id, lower(email));

create index event_registrations_form_idx on public.event_registrations (form_id);

alter table public.event_registrations enable row level security;

create policy "event_registrations: anyone may register while open"
  on public.event_registrations for insert
  to anon, authenticated
  with check (public.registration_is_open(form_id));

-- No read, update or delete policy for anon or members: staff only.
create policy "event_registrations: staff only"
  on public.event_registrations for all
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- A form's questions are frozen once it has answers, so exported rows keep
-- matching the questions people actually saw. The dates stay editable.
-- ---------------------------------------------------------------------------
create or replace function public.registration_form_fields_locked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.fields is distinct from old.fields
     and exists (select 1 from public.event_registrations r where r.form_id = old.id)
  then
    raise exception 'This form already has registrations, so its questions cannot change';
  end if;
  return new;
end;
$$;

create trigger registration_forms_lock_fields
  before update on public.registration_forms
  for each row execute function public.registration_form_fields_locked();
