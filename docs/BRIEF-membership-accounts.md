# BRIEF: MEMBERSHIP FORM, EVENT FORMS, BULK ADD AND ACCOUNT CREATION

Save this whole brief, word for word, as docs/BRIEF-membership-accounts.md, then do ONLY Steps 1 and 2 in this session.

## Standing rules
- Do not touch VAC-TECH Jr.html, VAC-Tech-Jr-Website-Plan.md or the root DESIGN.md. No new libraries (PapaParse and Zod are approved). Use only FAKE data.
- Security: RLS on every table; role checks in the database; NEW numbered migrations, never edit an applied one; the service role key exists only in Edge Function secrets, never in src/ or any VITE_ variable.
- Tests are deferred to the testing team: do not ask me to run tests. Append every new test to docs/TESTING.md.
- Things only I can do (running SQL, deploying functions): write numbered copy-paste steps in docs/OWNER-ACTIONS.md and keep building.
- After every step: lint and build, update docs/MEMORY.md (status, Resume here, trackers, session log) and docs/PHASES.md ("built, tests deferred"). If context runs low, finish the current step, write an exact Resume here, and stop.
- Unclear points: choose the safest default, log it under Decisions in MEMORY.md, continue.

## STEP 1: Complete the membership registration form (public + admin)
1. Audit /join and the admin side (applications list, membership window, form builder) against PRD PUB-09, ADM-05, ADM-06, ADM-14. Fix what is missing or unfinished and list what you fixed.
2. Core fields always present: full name, class, section, email, phone, consent. The club can add extra questions. Default extras: GitHub link (optional URL), interests (multiple choice: Web, AI, Robotics, Design, Cybersecurity, Games, Other), experience level (single choice), and "Why do you want to join?" (long text). Collect nothing else that is personal.
3. The consent wording is editable in the template and shown on the form. Add to docs/OWNER-ACTIONS.md: "School must approve the consent wording before real students apply."
4. Store a snapshot of the questions on each membership window, so old applications stay readable after the form changes. Extra answers go in an answers JSON column with a size check constraint. Keep every existing protection (window check, consent required, one application per email per window, length limits, status starts pending, visitors cannot read).
5. Admin applications page: filter by status and window, search, view answers, change status, CSV export (CSV-injection-safe), and a "Create member account" button on an approved application. It opens the create-member form prefilled (name, class, section, email, phone) and marks the application "account created" on success.
6. Opening a new membership window: choose a saved template or copy the last window, set dates, open.

## STEP 2: Saved templates for the future (migration 0008)
- Table form_templates: id, kind ('membership' or 'event'), name, description, fields (JSON), created_by, timestamps, is_archived. Staff (manager, admin, super_admin) can read, create and update; only admin and super_admin can delete. Visitors and members have no access.
- Seed these templates: "Standard membership", "Workshop registration", "Competition team registration", "Simple RSVP", "Feedback form".
- Builder actions: Save as template, Start from template (when creating an event form or opening a membership window), rename, duplicate, archive. Saving a template never changes forms already in use.
- Questions of a form that already has registrations stay locked (existing trigger). Offer "Duplicate as a new form" instead.

## STEP 3: Event registration builder with a wide range of options
1. Question types (builder and DynamicForm, with a Zod schema built from the definition): short text, long text, number, email, phone, URL, single choice (radio), dropdown, multiple choice (checkboxes), yes/no, date, time, rating 1 to 5, consent checkbox, preset pickers (class, section, T-shirt size), and an info block (heading or paragraph, no answer).
2. Per question: label, help text, placeholder, required, min/max length or number range, option list editor (add, reorder, remove), an "Other (please specify)" option, and min/max selections for multiple choice.
3. Builder usability: reorder with up and down buttons (large touch targets), duplicate and delete a question, live preview at mobile width, builder validation (no empty labels, no duplicate option values), and a simple rule "show this question only if [earlier question] equals [answer]".
4. Event settings: optional capacity with a waitlist toggle (status registered or waitlisted; capacity enforced in the database with a lock so two people cannot take the last seat), custom confirmation message, opening and closing times (Nepal time), one registration per email.
5. Answers are stored in a size-limited JSON keyed by question id, rendered as escaped plain text. The admin registrations list shows answers by question label, filters by status (registered, waitlisted, cancelled), and exports CSV with one column per question (multiple choices joined with "; ", CSV-injection-safe, readable even if the form changed later).

## STEP 4: Account creation with passwords (Edge Functions, highest risk)
Update or add functions in supabase/functions: create-member, bulk-create-members, create-staff, reset-password. All verify the caller from the JWT and check the role in the database.
1. Single member (admin and super_admin): full name, email, class, section, optional phone, and a password with two options: "Generate" (strong random, readable, no look-alike characters) or typed by the admin. Typed passwords: at least 10 characters, must not contain the email name or the person's name, not a common password; enforce on the server too. must_change_password is always true. The password is shown ONCE with a copy button and is never stored or logged (also not in audit logs); responses are marked no-store.
2. Bulk member add (admin and super_admin), a new "Add many members" page:
   - Download a CSV template (full_name, email, class, section, optional phone, optional password) or paste rows.
   - Parse in the browser and show a preview table with a status per row (valid, invalid email, duplicate in file, account already exists, missing class or section). The admin can fix or skip rows, then confirm.
   - Default: a different generated password per member. If the CSV has a password column, validate those with the same rules. DO NOT offer one shared password for everyone.
   - Limit 200 rows per import, sent in small chunks, per-row result (created, or failed with a plain reason).
   - After the import: a "Credentials" screen with each name, email and temporary password shown ONCE, with "Download CSV" and "Print credential slips" (one slip per member: name, email, temporary password, login address, a line telling them to change the password at first login). Warn the admin to hand these over personally and delete the file afterwards.
3. Staff accounts: a "Create staff account" page, super_admin only. Fields: role (Admin or Manager), full name, email, password (generate or type, same rules). No class, section or phone. must_change_password is true. No function can create a super_admin. The last super_admin cannot be demoted or deactivated.
4. Make profiles.class and profiles.section nullable for staff, with a check constraint that they are required when role = 'member'. public_members must show ONLY role = 'member' AND is_active = true. Check that existing admin and member pages still work with null class and section.
5. reset-password (admin and super_admin; super_admin for staff accounts): same generate-or-type options and the same show-once rule.
6. Write every account action (create, bulk summary, staff creation, reset, role change) to audit_log; create it if it does not exist (append-only: no update and no delete policies; readable by admin and super_admin only). Never write passwords.
7. Strict validation, per-caller rate limiting, CORS only for https://vactechjr.pages.dev and http://localhost:5173, plain-language errors. Add deploy commands to docs/OWNER-ACTIONS.md.

## STEP 5: Docs and final report
Update docs/PRD.md, docs/ARCHITECTURE.md, docs/TESTING.md and docs/OWNER-ACTIONS.md. Run lint, build and prettier. Confirm no secrets and no logged passwords. Reply with what you built, every decision you made, the order of OWNER-ACTIONS, and what I should look at first (the account functions come first).
