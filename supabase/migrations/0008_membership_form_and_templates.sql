-- 0008_membership_form_and_templates.sql
-- Two things for the membership-form / templates brief:
--
--   1. The membership form becomes data, not code. Each membership window keeps a
--      SNAPSHOT of its questions (`fields`), so an application stays readable after
--      the form is changed, and extra answers go in a size-limited `answers` JSON.
--      The five core answers stay in their own columns exactly as before.
--   2. `form_templates` — reusable question lists for a membership window or an
--      event registration form. Staff may read, create and update; only Admin and
--      Super Admin may delete. Visitors and members have no access at all.
--
-- Nothing already applied is edited: `0005` still owns the tables, this file only
-- adds to them. Once applied, never edit this file: add a new numbered migration.
--
-- Decisions (see MEMORY.md section 5):
--  * `fields` defaults to an empty array; the client falls back to the built-in
--    membership questions when a window predates this migration. No question list
--    is duplicated in SQL.
--  * `reason` keeps its own column (it already had one); only genuinely new
--    questions land in `answers`.
--  * Step 2's `form_templates` table lives here with Step 1's columns so the owner
--    runs one file, not two.

-- ---------------------------------------------------------------------------
-- The membership window's question snapshot.
-- ---------------------------------------------------------------------------
alter table public.membership_windows
  add column fields jsonb not null default '[]'::jsonb
    check (jsonb_typeof(fields) = 'array' and jsonb_array_length(fields) <= 25);

-- ---------------------------------------------------------------------------
-- Extra answers (keyed by question id) and the "account created" mark.
-- ---------------------------------------------------------------------------
alter table public.membership_applications
  add column answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object' and length(answers::text) <= 8000),
  add column account_created_at timestamptz;

-- ---------------------------------------------------------------------------
-- Saved templates (Step 2). One question list, reusable by many forms.
-- ---------------------------------------------------------------------------
create table public.form_templates (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('membership', 'event')),
  name        text not null check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 400),
  fields      jsonb not null default '[]'::jsonb
                check (jsonb_typeof(fields) = 'array' and jsonb_array_length(fields) <= 25),
  created_by  uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  is_archived boolean not null default false
);

create index form_templates_kind_idx on public.form_templates (kind);

alter table public.form_templates enable row level security;

create policy "form_templates: staff can read"
  on public.form_templates for select
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "form_templates: staff can create"
  on public.form_templates for insert
  to authenticated
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

create policy "form_templates: staff can update"
  on public.form_templates for update
  to authenticated
  using (public.current_role() in ('manager', 'admin', 'super_admin'))
  with check (public.current_role() in ('manager', 'admin', 'super_admin'));

-- Deleting a template is destructive, so it is Admin and Super Admin only.
create policy "form_templates: admin can delete"
  on public.form_templates for delete
  to authenticated
  using (public.current_role() in ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Seed templates. Saved once, when this migration runs. edited later from the
-- Form templates page. `created_by` is null: these are the club's starting set.
-- ---------------------------------------------------------------------------
insert into public.form_templates (kind, name, description, fields) values

('membership', 'Standard membership',
 'The club''s default membership questions: the five core answers plus GitHub link, interests, experience level and a short reason.',
$fields$[
  { "id": "full_name", "label": "Full name", "type": "text", "required": true, "max": 120 },
  { "id": "class", "label": "Class", "type": "text", "required": false, "max": 40, "help": "For example 11 or 12" },
  { "id": "section", "label": "Section", "type": "text", "required": false, "max": 40 },
  { "id": "email", "label": "Email", "type": "email", "required": true, "max": 160 },
  { "id": "phone", "label": "Phone", "type": "tel", "required": false, "max": 30 },
  { "id": "github_url", "label": "GitHub link", "type": "url", "required": false, "max": 200 },
  { "id": "interests", "label": "Interests", "type": "multiselect", "required": false, "options": ["Web", "AI", "Robotics", "Design", "Cybersecurity", "Games", "Other"] },
  { "id": "experience_level", "label": "Experience level", "type": "select", "required": false, "options": ["Beginner", "Some experience", "Confident"] },
  { "id": "reason", "label": "Why do you want to join?", "type": "textarea", "required": false, "max": 1000 },
  { "id": "consent", "label": "My name, class and GitHub link may be shown on the club's public pages.", "type": "consent", "required": true }
]$fields$::jsonb),

('event', 'Workshop registration',
 'Name, email, class and one session question. The usual shape for a club workshop.',
$fields$[
  { "id": "full_name", "label": "Full name", "type": "text", "required": true },
  { "id": "email", "label": "Email", "type": "email", "required": true },
  { "id": "class", "label": "Class", "type": "text", "required": false },
  { "id": "section", "label": "Section", "type": "text", "required": false },
  { "id": "question", "label": "Which session do you want to attend?", "type": "textarea", "required": false }
]$fields$::jsonb),

('event', 'Competition team registration',
 'Name, email, class, T-shirt size and a note about the competition.',
$fields$[
  { "id": "full_name", "label": "Full name", "type": "text", "required": true },
  { "id": "email", "label": "Email", "type": "email", "required": true },
  { "id": "class", "label": "Class", "type": "text", "required": true },
  { "id": "section", "label": "Section", "type": "text", "required": true },
  { "id": "tshirt", "label": "T-shirt size", "type": "select", "required": false, "options": ["S", "M", "L", "XL", "XXL"] },
  { "id": "question", "label": "Which competition, and your experience?", "type": "textarea", "required": false }
]$fields$::jsonb),

('event', 'Simple RSVP',
 'Name, email and one optional line. The lightest form for a meet-up.',
$fields$[
  { "id": "full_name", "label": "Full name", "type": "text", "required": true },
  { "id": "email", "label": "Email", "type": "email", "required": true },
  { "id": "question", "label": "Anything to add?", "type": "textarea", "required": false }
]$fields$::jsonb),

('event', 'Feedback form',
 'Name, email and what they thought of the event.',
$fields$[
  { "id": "full_name", "label": "Full name", "type": "text", "required": false },
  { "id": "email", "label": "Email", "type": "email", "required": false },
  { "id": "question", "label": "What did you think of the event?", "type": "textarea", "required": true }
]$fields$::jsonb);
