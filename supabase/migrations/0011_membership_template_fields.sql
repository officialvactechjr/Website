-- 0011_membership_template_fields.sql
-- The club's membership questions, as the owner set them out:
--
--   full name, faculty, class, section, email, skills / bio, and the committee
--   they want to be enrolled in — plus the consent line.
--
-- Only the question list changes. `faculty`, `skills` and `committee` are extra
-- questions, so they are stored in `membership_applications.answers` (the JSON
-- column `0008` added); full name, class, section, email and consent keep their
-- own columns. Nothing is dropped and no protection is touched: the open-window
-- check, the consent requirement, one application per email per window, the
-- length limits and the staff-only read all stay exactly as they are.
--
-- The window's own question snapshot is what a live form renders, so a window
-- created from the template before this change keeps its old questions. Create
-- the next window from the updated template (or copy it) to pick these up.
--
-- Once applied, never edit this file: add a new numbered migration.

update public.form_templates
set
  description = 'The club''s standard membership questions: name, faculty, class, section, email, skills / bio and the committee they want to join.',
  fields = $fields$[
    { "id": "full_name", "label": "Full name", "type": "text", "required": true, "max": 120 },
    { "id": "faculty", "label": "Faculty", "type": "text", "required": true, "max": 40, "help": "For example Science or Management" },
    { "id": "class", "label": "Class", "type": "text", "required": true, "max": 40, "help": "For example 11 or 12" },
    { "id": "section", "label": "Section", "type": "text", "required": true, "max": 40 },
    { "id": "email", "label": "Email", "type": "email", "required": true, "max": 160 },
    { "id": "skills", "label": "Skills / bio", "type": "textarea", "required": false, "max": 1000 },
    { "id": "committee", "label": "Which committee do you want to join?", "type": "select", "required": true, "options": ["Coding", "Graphics Design", "ECA", "PR"] },
    { "id": "consent", "label": "My name, class and GitHub link may be shown on the club's public pages.", "type": "consent", "required": true }
  ]$fields$::jsonb,
  updated_at = now()
where kind = 'membership'
  and name = 'Standard membership';

-- If `0008` has not run yet (or the template was deleted), add it now, so the
-- club always has one membership template with these questions.
insert into public.form_templates (kind, name, description, fields)
select
  'membership',
  'Standard membership',
  'The club''s standard membership questions: name, faculty, class, section, email, skills / bio and the committee they want to join.',
  $fields$[
    { "id": "full_name", "label": "Full name", "type": "text", "required": true, "max": 120 },
    { "id": "faculty", "label": "Faculty", "type": "text", "required": true, "max": 40, "help": "For example Science or Management" },
    { "id": "class", "label": "Class", "type": "text", "required": true, "max": 40, "help": "For example 11 or 12" },
    { "id": "section", "label": "Section", "type": "text", "required": true, "max": 40 },
    { "id": "email", "label": "Email", "type": "email", "required": true, "max": 160 },
    { "id": "skills", "label": "Skills / bio", "type": "textarea", "required": false, "max": 1000 },
    { "id": "committee", "label": "Which committee do you want to join?", "type": "select", "required": true, "options": ["Coding", "Graphics Design", "ECA", "PR"] },
    { "id": "consent", "label": "My name, class and GitHub link may be shown on the club's public pages.", "type": "consent", "required": true }
  ]$fields$::jsonb
where not exists (
  select 1
  from public.form_templates
  where kind = 'membership' and name = 'Standard membership'
);
