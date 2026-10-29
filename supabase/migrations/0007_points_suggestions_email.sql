-- 0007_points_suggestions_email.sql
-- Points (audit only), the anonymous suggestion box, the outbound email log, and
-- the one view managers need to review projects without seeing account data.
--
-- WHO CAN WRITE WHAT
--   points_log    Admin and Super Admin, INSERT only, always attributed to
--                 themselves. No update, no delete anywhere: the log is the
--                 audit trail, and a deduction is a negative row, not an edit.
--   suggestions   Members insert their own; staff may only flip `is_read` and
--                 the read stamps. `author_id` exists for rate limiting and
--                 abuse handling and is never readable by any client role.
--   email_log     Service role only (the send-email Edge Function). Admins read.
--
-- Once applied, never edit this file: add a new numbered migration instead.

-- ---------------------------------------------------------------------------
-- points_log: locked to INSERT for Admin and Super Admin (PRD ADM-11). The
-- `for all` policy from 0004 also allowed update and delete, so it is replaced.
-- ---------------------------------------------------------------------------
drop policy "points_log: staff only" on public.points_log;

create policy "points_log: admins read"
  on public.points_log for select
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));

create policy "points_log: admins award"
  on public.points_log for insert
  to authenticated
  with check (
    public.current_role() in ('admin', 'super_admin')
    -- A row always says who actually gave it, and always explains itself.
    and given_by = auth.uid()
    and points <> 0
    and btrim(coalesce(reason, '')) <> ''
  );

-- The same rules as table constraints, so a future policy tweak cannot quietly
-- let a zero-point or unexplained row through.
alter table public.points_log
  add constraint points_log_points_not_zero check (points <> 0),
  add constraint points_log_reason_required check (btrim(coalesce(reason, '')) <> '');

-- ---------------------------------------------------------------------------
-- suggestions: anonymous to readers. The author is stored for abuse control
-- only, and is unreadable from the browser by column privilege AND by RLS.
-- ---------------------------------------------------------------------------
create table public.suggestions (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles (id) on delete cascade,
  message    text not null check (char_length(message) between 10 and 2000),
  is_read    boolean not null default false,
  read_at    timestamptz,
  read_by    uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index suggestions_created_at_idx on public.suggestions (created_at desc);
create index suggestions_author_recent_idx on public.suggestions (author_id, created_at desc);

alter table public.suggestions enable row level security;

create policy "suggestions: members send their own"
  on public.suggestions for insert
  to authenticated
  with check (author_id = auth.uid());

-- Rows are visible to staff through the sanitized view below; the policy here
-- exists so the mark-read update has something to stand on.
create policy "suggestions: staff read all"
  on public.suggestions for select
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "suggestions: staff mark read"
  on public.suggestions for update
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- `author_id` is not grantable to any client role: reading it is refused at the
-- column level, before RLS even runs. PostgREST must ask for the listed columns.
revoke select on public.suggestions from anon, authenticated;
grant select (id, message, is_read, read_at, created_at) on public.suggestions to authenticated;

-- The staff inbox reads this, so `author_id` cannot appear even by accident.
create view public.staff_suggestions as
select
  s.id,
  s.message,
  s.is_read,
  s.read_at,
  s.created_at
from public.suggestions s
where public.current_role() in ('manager', 'admin', 'super_admin');

grant select on public.staff_suggestions to authenticated;

-- A staff member may only mark a suggestion read. The message and the author are
-- frozen, so "read" cannot become "edited" or "deleted from view".
create or replace function public.suggestions_mark_read_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- service role and the SQL editor
  end if;

  new.author_id := old.author_id;
  new.message := old.message;
  new.created_at := old.created_at;

  if new.is_read is distinct from old.is_read then
    if new.is_read then
      new.read_at := now();
      new.read_by := auth.uid();
    else
      new.read_at := null;
      new.read_by := null;
    end if;
  end if;

  return new;
end;
$$;

create trigger suggestions_mark_read_only
  before update on public.suggestions
  for each row execute function public.suggestions_mark_read_only();

-- ---------------------------------------------------------------------------
-- Abuse control: 10 suggestions per author per day. The count runs as the table
-- owner, so a member cannot learn anything from the error beyond "too many".
-- ---------------------------------------------------------------------------
create or replace function public.suggestions_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.suggestions s
    where s.author_id = new.author_id
      and s.created_at > now() - interval '24 hours'
  ) >= 10 then
    raise exception 'Too many suggestions in one day. Please try again tomorrow';
  end if;

  return new;
end;
$$;

create trigger suggestions_rate_limit
  before insert on public.suggestions
  for each row execute function public.suggestions_rate_limit();

-- ---------------------------------------------------------------------------
-- projects: a member's edit clears the previous review, not just the status.
-- `0006` re-queued the project but kept the last reviewer's note, so a re-queued
-- card showed staff a reason that described the *old* version. Clearing the three
-- columns makes a re-queued project look exactly like a fresh one.
-- ---------------------------------------------------------------------------
create or replace function public.protect_project_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.user_role := public.current_role();
begin
  if auth.uid() is null then
    return new;
  end if;

  if actor in ('manager', 'admin', 'super_admin') then
    if new.status = 'rejected' and coalesce(btrim(new.review_note), '') = '' then
      raise exception 'A rejected project needs a reason in review_note';
    end if;
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.status := 'pending';
  new.review_note := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- email_log: one row per outbound broadcast (PRD ADM-13). Written only by the
-- send-email Edge Function with the service role, so there is no insert policy.
-- ---------------------------------------------------------------------------
create table public.email_log (
  id              uuid primary key default gen_random_uuid(),
  sent_by         uuid references public.profiles (id) on delete set null,
  subject         text not null check (char_length(subject) between 1 and 200),
  body            text not null check (char_length(body) between 1 and 20000),
  recipient_group text not null check (char_length(recipient_group) <= 60),
  recipient_count int not null default 0 check (recipient_count >= 0),
  provider        text check (char_length(provider) <= 40),
  status          text not null default 'sent' check (status in ('sent', 'failed')),
  error           text check (char_length(error) <= 500),
  created_at      timestamptz not null default now()
);

create index email_log_created_at_idx on public.email_log (created_at desc);

alter table public.email_log enable row level security;

create policy "email_log: admins read"
  on public.email_log for select
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));

-- No insert, update or delete policy: the browser cannot write this table at
-- all. The recipient list itself is never stored: only the group that was used
-- and how many people it reached.
