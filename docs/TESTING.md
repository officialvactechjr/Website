# TESTING.md: the plan for the testing team

Every test written for this project, in one place, grouped by phase. Built for a **single end-to-end
pass**: the testing team runs Phase 1 through Phase 8 in order and ticks the Pass/Fail column.

> **Rule:** a ticked box in `PHASES.md` means _built and reviewed_. It never means _verified_.
> Only a tick in this file means verified.

**Accounts are named by role below:** _visitor_ (nobody logged in), _member_, _manager_, _admin_, _super admin_.

**Nothing in Phase 6, 7 or 8 has ever been executed.** Migrations `0005`, `0006` and `0007` are not
applied and no Edge Function is deployed, so the pass cannot start until `docs/OWNER-ACTIONS.md`
sections 2 and 5 are done. **Section 11** groups every test by the role that runs it, for a tester who
wants to stay signed in as one account and work straight through.

---

## 1. Setup

### 1.1 Before you start

- **Migrations**, in this order: `0001_profiles_roles.sql`, `0002_content_tables.sql`,
  `0003_profiles_protection.sql`, `0004_showcase_tables.sql`, `0005_registrations.sql`,
  `0006_projects_and_profile_changes.sql`, `0007_points_suggestions_email.sql`
  (Supabase → SQL Editor → paste the whole file → Run).
- **Edge Functions:** deploy all seven (`docs/OWNER-ACTIONS.md` section 5) and set the secrets
  (section 4). Tests from Phase 6 onward that create accounts, send email, change a role or apply a
  profile change need them; the rest work without.
- **Seed:** run `supabase/seed.sql`. It is re-runnable and adds the sample notices, events, board,
  gallery, projects, points, **one open membership window** and **one event form**. All of it is fake.
- **The app:** `npm run dev` for local, or the Cloudflare address. `.env` needs
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 1.2 Test accounts

Create each one in **Authentication → Users → Add user** (tick _Auto Confirm_), then add its profile
row in the SQL editor. Copy the UUID from the Users list into the statement below.

```sql
-- repeat once per account, changing the uuid, the name and the role
insert into public.profiles (id, full_name, role, class, section, is_active, must_change_password)
values ('<paste-the-user-uuid>', 'Test Member', 'member', '11', 'A', true, true);
```

| Role        | What you need                                                             |
| ----------- | ------------------------------------------------------------------------- |
| visitor     | nothing — just do not log in (use a private window so no session lingers) |
| member      | one account with `role = 'member'`, `must_change_password = true`         |
| manager     | one account with `role = 'manager'` — several Phase 7 tests need it       |
| admin       | one account with `role = 'admin'`                                         |
| super admin | one account with `role = 'super_admin'`                                   |

Use names like "Test Member" and emails like `test.member@example.com`. **Never a real student.**

### 1.3 Running a console test

Open the app, press F12 for the console, and paste the snippet. The console can import the app's own
Supabase client, so there are no API keys to copy.

For every snippet, the two lines you write are baked in: it says **Expected** just above it. If you
see a different result, write the actual text in the Pass/Fail column and open an issue.

### 1.4 Reset between runs

This deletes the rows the tests create — safe while testing, never run it once real data is in.

```sql
delete from public.event_registrations;
delete from public.membership_applications;
delete from public.registration_forms;
delete from public.membership_windows;
-- Phase 6 and 7 rows the tests create
delete from public.profile_change_requests;
delete from public.projects;
delete from public.suggestions;
delete from public.email_log;
delete from public.points_log;
```

Then run `supabase/seed.sql` again to put the open window, the sample form, the projects and the
points back. Accounts made through `/admin/members` are deleted in **Authentication → Users**, not in
SQL: their profile rows cascade away with the login.

---

## 2. Phase 1 — Auth, roles and the app shell

| #    | Goal                                                                           | Sign in as  | Steps                                                                                               | Expected                                                       | Pass / Fail |
| ---- | ------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| P1.1 | First login forces a password change, staff land on the panel                  | super admin | Log in with the temporary password                                                                  | Sent to `/change-password`; after saving, sent to `/admin`     | ☐           |
| P1.2 | A member lands on the public site, not the panel                               | member      | Log in                                                                                              | Sent to `/` (home), not `/member`                              | ☐           |
| P1.3 | A deactivated account is refused                                               | member      | In SQL: `update public.profiles set is_active = false where full_name = 'Test Member';` then log in | "This account is deactivated" and no session stays             | ☐           |
| P1.4 | A visitor cannot reach the panel                                               | visitor     | Open `/admin`                                                                                       | Sent to `/login`                                               | ☐           |
| P1.5 | A member cannot reach the panel                                                | member      | Open `/admin`                                                                                       | Sent back to `/`                                               | ☐           |
| P1.6 | **Security:** a member cannot grant themselves a role or reactivate themselves | member      | Snippet S1.6                                                                                        | Both updates REFUSED ("Only a super admin…", "Only an admin…") | ☐           |
| P1.7 | **Security:** a member cannot change their own name, class or section          | member      | Snippet S1.7                                                                                        | Update REFUSED by `protect_profile_columns`                    | ☐           |
| P1.8 | A member CAN still edit their own GitHub link                                  | member      | Snippet S1.8                                                                                        | Update succeeds                                                | ☐           |

### Snippets

**S1.6**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id, role').single()
console.log(
  'role:',
  (await supabase.from('profiles').update({ role: 'admin' }).eq('id', me.id)).error?.message ??
    'CHANGED — this is a bug',
)
console.log(
  'active:',
  (await supabase.from('profiles').update({ is_active: false }).eq('id', me.id)).error?.message ??
    'CHANGED — this is a bug',
)
```

**S1.7**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
console.log(
  'name:',
  (await supabase.from('profiles').update({ full_name: 'Hacked' }).eq('id', me.id)).error
    ?.message ?? 'CHANGED — this is a bug',
)
console.log(
  'class:',
  (await supabase.from('profiles').update({ class: '12' }).eq('id', me.id)).error?.message ??
    'CHANGED — this is a bug',
)
```

**S1.8**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
console.log(
  'github:',
  (
    await supabase
      .from('profiles')
      .update({ github_url: 'https://github.com/example' })
      .eq('id', me.id)
  ).error?.message ?? 'ok, saved',
)
```

---

## 3. Phase 2 — Public pages A

| #     | Goal                                       | Sign in as | Steps                                                                                 | Expected                                                                                                           | Pass / Fail |
| ----- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| P2.1  | The intro animation plays on the home page | visitor    | Open `/` in a **fresh private window**                                                | Logo assembles, then flies into the header, then the page fades in                                                 | ☐           |
| P2.2  | The intro plays only once per session      | visitor    | Staying in that window, press F5                                                      | No intro; the page is visible at once                                                                              | ☐           |
| P2.3  | Other pages never show the intro           | visitor    | Open `/notices` in a fresh private window                                             | No intro                                                                                                           | ☐           |
| P2.4  | Skip works                                 | visitor    | Open `/` fresh; click **Skip intro**, then reload and press **Esc** on a fresh window | Intro ends immediately both times; content visible                                                                 | ☐           |
| P2.5  | Reduced motion is respected                | visitor    | Turn on "reduce motion" in the OS, then open `/` fresh                                | No intro at all; the page is simply there                                                                          | ☐           |
| P2.6  | Mobile layout holds                        | visitor    | View `/` at 360px wide                                                                | No sideways scrolling; hamburger appears; the hero robot fits                                                      | ☐           |
| P2.7  | Notices list and detail                    | visitor    | Open `/notices`, click the first notice                                               | Pinned notices first; the detail page opens with date, title and body                                              | ☐           |
| P2.8  | Events list and archive                    | visitor    | Open `/events`, switch to **Past**                                                    | Upcoming and past lists both fill from the seed; the tab stays in the URL                                          | ☐           |
| P2.9  | Contact details come from settings         | visitor    | Open `/contact`                                                                       | The seed's site name and location appear                                                                           | ☐           |
| P2.10 | Both themes are readable                   | visitor    | Use the sun/moon button on `/notices`                                                 | Colours swap; every word stays readable in both                                                                    | ☐           |
| P2.11 | Home shows every section                   | visitor    | Open `/`                                                                              | What the club does, Notices, Events, Projects, Top contributors, Board, Explore links and the Join card all appear | ☐           |

_(No console snippets in this phase — it is all visual.)_

---

## 4. Phase 3 — Public pages B

| #    | Goal                                                   | Sign in as | Steps                                                                                       | Expected                                                                      | Pass / Fail |
| ---- | ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| P3.1 | A visitor can read the public data                     | visitor    | Snippet S3.1                                                                                | Views and public tables all return rows, no errors                            | ☐           |
| P3.2 | **Security:** raw people tables are closed to visitors | visitor    | Snippet S3.2                                                                                | `profiles`, `projects`, `points_log` each return **0 rows**, not an error     | ☐           |
| P3.3 | **Security:** a member cannot write content            | member     | Snippet S3.3                                                                                | Every insert REFUSED by row level security                                    | ☐           |
| P3.4 | **Security:** unapproved projects stay hidden          | visitor    | Snippet S3.4                                                                                | Only the two approved projects appear; the pending and rejected ones never do | ☐           |
| P3.5 | A manager or admin can publish a gallery photo         | admin      | Snippet S3.5                                                                                | Insert succeeds, then delete succeeds                                         | ☐           |
| P3.6 | The pages themselves work                              | visitor    | Open `/bod`, `/gallery` (open a photo), `/projects`, a project, `/contributors`, `/members` | Each shows the seed content; the lightbox opens and closes with Esc           | ☐           |

### Snippets

**S3.1**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
for (const t of [
  'public_members',
  'public_projects',
  'leaderboard',
  'bod_members',
  'gallery_photos',
]) {
  const { data, error } = await supabase.from(t).select('*')
  console.log(t, error ? 'ERROR ' + error.message : data.length + ' rows')
}
```

**S3.2**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
for (const t of ['profiles', 'projects', 'points_log']) {
  const { data, error } = await supabase.from(t).select('*')
  console.log(t, error ? 'blocked: ' + error.message : data.length + ' rows (must be 0)')
}
```

**S3.3**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const tries = [
  ['notices', { title: 'x', body: 'y' }],
  ['bod_members', { full_name: 'x', position: 'y' }],
  ['gallery_photos', { image_url: 'https://example.com/x.png' }],
  ['points_log', { member_id: '00000000-0000-0000-0000-000000000000', points: 1 }],
]
for (const [t, row] of tries)
  console.log(t, (await supabase.from(t).insert(row)).error?.message ?? 'INSERTED — this is a bug')
```

**S3.4**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data } = await supabase.from('public_projects').select('title')
console.log(
  'public titles:',
  data.map((p) => p.title),
)
```

Confirm in the SQL editor that the raw table holds more: `select title, status from public.projects order by status;`

**S3.5**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const ins = await supabase
  .from('gallery_photos')
  .insert({ image_url: 'https://placehold.co/1200x900', title: 'Temp test row' })
  .select()
  .single()
console.log('insert:', ins.error ? 'FAILED ' + ins.error.message : 'ok ' + ins.data.id)
if (ins.data)
  console.log(
    'delete:',
    (await supabase.from('gallery_photos').delete().eq('id', ins.data.id)).error?.message ?? 'ok',
  )
```

---

## 5. Phase 4 — Admin console

| #    | Goal                                                     | Sign in as | Steps                                                                                                            | Expected                                                                                                                  | Pass / Fail |
| ---- | -------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P4.1 | **Security:** a visitor cannot upload anything           | visitor    | Snippet S4.1                                                                                                     | All four buckets say `blocked:`                                                                                           | ☐           |
| P4.2 | **Security:** a member cannot upload anything            | member     | Snippet S4.1 again                                                                                               | All four buckets say `blocked:`                                                                                           | ☐           |
| P4.3 | Staff can upload and delete                              | admin      | Snippet S4.1 again                                                                                               | All four say `UPLOADED` then `delete: ok`                                                                                 | ☐           |
| P4.4 | **Security:** the bucket refuses the wrong type and size | admin      | Snippet S4.4                                                                                                     | Both return an error (mime type / maximum size)                                                                           | ☐           |
| P4.5 | The notice editor works end to end                       | admin      | `/admin/notices` → **New notice** → fill in → publish; then **Edit** the same row; then **Pin**; then **Delete** | Each step shows a green toast; the row appears; **Edit shows that notice's own text**; the delete dialog names the notice | ☐           |
| P4.6 | Editing two rows in a row does not mix them              | admin      | Edit notice A, close, edit notice B                                                                              | The second form shows B's text, never A's                                                                                 | ☐           |
| P4.7 | The image uploader shrinks a big photo                   | admin      | `/admin/events` → New event → choose a **3 MB phone photo** as the cover                                         | It uploads (it used to be refused); the preview appears                                                                   | ☐           |
| P4.8 | The dashboard adds up                                    | admin      | Open `/admin`, then add a notice and return                                                                      | The counts match the seed; the count updates after adding                                                                 | ☐           |

### Snippets

**S4.1**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
)
const file = new Blob([png], { type: 'image/png' })
for (const b of ['gallery', 'bod-photos', 'project-images', 'avatars']) {
  const path = `probe-${Date.now()}.png`
  const up = await supabase.storage.from(b).upload(path, file, { contentType: 'image/png' })
  console.log(b, 'upload:', up.error ? 'blocked: ' + up.error.message : 'UPLOADED')
  if (!up.error)
    console.log(
      b,
      'delete:',
      (await supabase.storage.from(b).remove([path])).error?.message ?? 'ok',
    )
}
```

**S4.4** — run as **admin**, or permission blocks first and you learn nothing about the limits.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
console.log(
  'text file:',
  (
    await supabase.storage
      .from('gallery')
      .upload(`t-${Date.now()}.txt`, new Blob(['hi'], { type: 'text/plain' }), {
        contentType: 'text/plain',
      })
  ).error?.message,
)
const big = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/png' })
console.log(
  '3 MB:     ',
  (
    await supabase.storage
      .from('gallery')
      .upload(`b-${Date.now()}.png`, big, { contentType: 'image/png' })
  ).error?.message,
)
```

---

## 6. Phase 5 — Registrations

| #     | Goal                                                       | Sign in as | Steps                                                                                                                            | Expected                                                                                                                                 | Pass / Fail |
| ----- | ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P5.1  | A visitor can apply while the window is open               | visitor    | Snippet S5.1                                                                                                                     | `INSERTED (expected)`                                                                                                                    | ☐           |
| P5.2  | **Security:** the window closes for real                   | visitor    | In SQL: `update public.membership_windows set is_open = false;` then run S5.1 again                                              | `BLOCKED` by row level security                                                                                                          | ☐           |
| P5.3  | A window with past dates is also closed                    | visitor    | Set `is_open = true` and push both dates into the past, then run S5.1                                                            | `BLOCKED`                                                                                                                                | ☐           |
| P5.4  | **Security:** a visitor cannot read the two private tables | visitor    | Snippet S5.4                                                                                                                     | Both return **0 rows**                                                                                                                   | ☐           |
| P5.5  | **Security:** a member cannot read them either             | member     | Snippet S5.4 again                                                                                                               | Both return **0 rows**                                                                                                                   | ☐           |
| P5.6  | Staff can read, judge and export                           | admin      | Snippet S5.6, then `/admin/applications` and **Export CSV**                                                                      | Rows listed, status updates, a CSV downloads and opens                                                                                   | ☐           |
| P5.7  | The same email cannot apply twice                          | visitor    | Run S5.1 twice with the **same** email                                                                                           | Second one rejected; the UI toast says "That email has already applied in this window."                                                  | ☐           |
| P5.8  | **Security:** consent must be ticked                       | visitor    | Snippet S5.8                                                                                                                     | Rejected by the consent check                                                                                                            | ☐           |
| P5.9  | **Security:** oversized input is refused                   | visitor    | Snippet S5.9                                                                                                                     | Rejected by the length check                                                                                                             | ☐           |
| P5.10 | Event registration obeys its window                        | visitor    | Snippet S5.10 while open; then set the event to **Draft** in `/admin/events` and run again                                       | `INSERTED (expected)` then `BLOCKED`                                                                                                     | ☐           |
| P5.11 | A closed form refuses too                                  | visitor    | Push the form's `closes_at` into the past, run S5.10 again                                                                       | `BLOCKED`                                                                                                                                | ☐           |
| P5.12 | **Security:** CSV injection is blocked                     | any        | Snippet S5.12                                                                                                                    | The four risky cells come back with a leading apostrophe; `Normal` does not                                                              | ☐           |
| P5.13 | **Security:** the helpers have a fixed search_path         | any        | Snippet S5.13 in the SQL editor                                                                                                  | Every row shows `search_path=public`                                                                                                     | ☐           |
| P5.14 | The Join page works end to end                             | visitor    | Open `/join`, fill it in, send                                                                                                   | The form shows the closing date and a countdown while open; a success message after sending; the closed state with dates when it is shut | ☐           |
| P5.15 | Home follows the window                                    | visitor    | Open `/` with the window open, then close it in SQL and reload                                                                   | Open: "Membership registration is open", a countdown and both join buttons. Closed: "Registration opens soon." and no join buttons       | ☐           |
| P5.16 | The event form works end to end                            | visitor    | Open the seeded event, fill the form, send; then check `/admin/registrations`                                                    | Success message; the row appears for staff with every answer readable                                                                    | ☐           |
| P5.17 | The form builder and its lock                              | admin      | `/admin/registration-forms` → **New form** → choose questions → save; then send one registration and try to change the questions | Saves; once an answer exists the question boxes are locked and the dates still save                                                      | ☐           |

### Snippets

**S5.1** — send it twice for S5.7, changing nothing else.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const win = (await supabase.from('membership_windows').select('id').limit(1)).data?.[0]
const { error } = await supabase.from('membership_applications').insert({
  window_id: win.id,
  full_name: 'Test Applicant',
  class: '11',
  section: 'A',
  email: `${Date.now()}@example.com`,
  phone: '9800000000',
  reason: 'Fake test data',
  consent: true,
})
console.log(error ? 'BLOCKED ' + error.message : 'INSERTED (expected)')
```

**S5.4**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
for (const t of ['membership_applications', 'event_registrations']) {
  const { data, error } = await supabase.from(t).select('*')
  console.log(t, error ? 'blocked: ' + error.message : data.length + ' rows (must be 0)')
}
```

**S5.6**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data } = await supabase.from('membership_applications').select('id, full_name, status')
console.log('staff see', data?.length, 'applications')
if (data?.[0])
  console.log(
    'status:',
    (
      await supabase
        .from('membership_applications')
        .update({ status: 'approved' })
        .eq('id', data[0].id)
    ).error?.message ?? 'ok',
  )
```

**S5.8** — same as S5.1 with `consent: false`.

**S5.9** — same as S5.1 with `full_name: 'x'.repeat(200)`.

**S5.10**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const form = (await supabase.from('registration_forms').select('id').limit(1)).data?.[0]
const { error } = await supabase.from('event_registrations').insert({
  form_id: form.id,
  full_name: 'Test',
  email: `${Date.now()}@example.com`,
  answers: { class: '11' },
})
console.log(error ? 'BLOCKED ' + error.message : 'INSERTED (expected)')
```

**S5.12**

```js
const { csvCell } = await import('/src/lib/utils.js')
console.log(['=SUM(1)', '+1', '-5', '@x', 'Normal'].map(csvCell).join(' | '))
```

Expected: `'=SUM(1) | '+1 | '-5 | '@x | Normal`

**S5.13** — in the SQL editor:

```sql
select proname, proconfig
from pg_proc
where proname in ('current_role', 'membership_window_is_open', 'registration_is_open',
                  'registration_form_fields_locked', 'protect_profile_columns')
order by proname;
```

Expected: five rows, each with `search_path=public`.

---

## 7. Cleanup between runs

> The final, pre-launch version of this is **section 12**. This one is for tidying up after a sitting
> so the next tester starts clean.

1. Run the reset SQL from section 1.4, then re-run `supabase/seed.sql` if you want the samples back.
2. **Turn the seed membership window off** (or delete it) before the site is public — otherwise it sits
   open and collects applications nobody asked for:
   ```sql
   update public.membership_windows set is_open = false;
   ```
3. Delete the test accounts in **Authentication → Users** (their profile rows disappear with them).
4. Remove any files the upload tests left behind: **Storage → gallery / bod-photos / project-images /
   avatars**, look for `probe-*.png`.
5. Write what failed into the Pass/Fail columns, then into `docs/MEMORY.md` section 6.

---

## 8. Phase 6 — Members, projects and profile changes

Setup first: apply `0006_projects_and_profile_changes.sql`, and deploy the six Edge Functions
(`docs/OWNER-ACTIONS.md` section 5). Tests P6.4 to P6.9 need a **deployed** function; the rest work
without one.

| #     | Goal                                                                     | Sign in as         | Steps                                                                          | Expected                                                                                                       | Pass / Fail |
| ----- | ------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------- |
| P6.1  | **Security:** a member cannot set their own project to approved          | member             | Snippet S6.1                                                                   | Insert REFUSED, or the row lands as `pending`                                                                  | ☐           |
| P6.2  | **Security:** a member's edit re-queues the project                      | admin, then member | Approve a project in `/admin/approvals`; then, as the member, change its title | It disappears from the public list and reappears as `pending`, **with no leftover review note**                | ☐           |
| P6.3  | **Security:** a rejection needs a reason                                 | admin              | `/admin/approvals` → Reject with the reason box empty                          | Refused, with a plain message                                                                                  | ☐           |
| P6.4  | A member can only write their own storage folder                         | member             | Snippet S6.4                                                                   | The file under their own uid succeeds; the one under a made-up uid is blocked                                  | ☐           |
| P6.5  | **Security:** a member cannot write another member's project row         | member             | Snippet S6.5                                                                   | Update affects **0 rows**                                                                                      | ☐           |
| P6.6  | **Security:** a member cannot write email, phone, name, class or section | member             | Snippet S6.6                                                                   | Every update REFUSED                                                                                           | ☐           |
| P6.7  | A member **can** change their GitHub link and photo                      | member             | Snippet S6.7                                                                   | Both succeed                                                                                                   | ☐           |
| P6.8  | **Security:** a manager cannot read `profiles`                           | manager            | Snippet S6.8                                                                   | 0 rows; the public member list still works                                                                     | ☐           |
| P6.9  | A profile change request travels and applies                             | member then admin  | Snippet S6.9, then approve it in `/admin/profile-changes`                      | Request saved; after approval the new value is on the profile — and an **email** change also updates the login | ☐           |
| P6.10 | One open request per field                                               | member             | Run S6.9 twice with the same field                                             | Second one rejected (duplicate)                                                                                | ☐           |
| P6.11 | Create one account and hand over the password                            | admin              | `/admin/members` → New member → create                                         | A dialog shows the email and a temporary password **once**; the account appears in the list                    | ☐           |
| P6.12 | Import a CSV of members                                                  | admin              | Download the template, add 2 rows, import                                      | Per-row results; both accounts exist; a repeated email is reported, not silently skipped                       | ☐           |
| P6.13 | Reset a password                                                         | admin              | Reset on a member row                                                          | A new temporary password appears once; the member is forced to change it at next login                         | ☐           |
| P6.14 | **Security:** an admin cannot reset a super admin                        | admin              | Reset a `super_admin` row                                                      | Refused with a plain message                                                                                   | ☐           |
| P6.15 | Deactivate and reactivate                                                | admin              | Toggle a member off, then on                                                   | Off: the member is signed out and cannot log in. On: they can                                                  | ☐           |
| P6.16 | **Security:** the last super admin cannot be deactivated                 | admin              | Deactivate the only active `super_admin`                                       | Refused                                                                                                        | ☐           |
| P6.17 | **Security:** a role change is super-admin only                          | admin              | Snippet S6.17 (call `change-role` as an admin)                                 | 403, "You do not have permission for that."                                                                    | ☐           |
| P6.18 | **Security:** nobody can create or promote a super admin                 | super admin        | Snippet S6.18                                                                  | `role: 'super_admin'` rejected; changing your own role rejected                                                | ☐           |

### Snippets

**S6.1** — a member tries to publish their own project.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
const ins = await supabase
  .from('projects')
  .insert({ owner_id: me.id, title: 'Test project', status: 'approved' })
  .select()
console.log('approve on insert:', ins.error ? 'BLOCKED ' + ins.error.message : ins.data)
```

Then read it back: `select status from public.projects where title = 'Test project';` — it must not be there.

**S6.4** — the storage folder rule.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
)
const file = new Blob([png], { type: 'image/png' })
for (const folder of [me.id, '00000000-0000-0000-0000-000000000000']) {
  const path = `${folder}/probe-${Date.now()}.png`
  const up = await supabase.storage
    .from('project-images')
    .upload(path, file, { contentType: 'image/png' })
  console.log(folder, up.error ? 'blocked: ' + up.error.message : 'UPLOADED')
  if (!up.error) await supabase.storage.from('project-images').remove([path])
}
```

**S6.5** and **S6.6** — other people's rows and the protected columns.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: rows } = await supabase.from('projects').select('id, owner_id')
console.log(
  'update someone else:',
  (await supabase.from('projects').update({ title: 'Hacked' }).select()).data?.length ?? 0,
  'rows (must be 0)',
)
const { data: me } = await supabase.from('profiles').select('id').single()
for (const patch of [
  { email: 'hacked@example.com' },
  { phone: '9800000000' },
  { full_name: 'Hacked' },
  { class: '12' },
  { section: 'Z' },
]) {
  console.log(
    Object.keys(patch)[0],
    (await supabase.from('profiles').update(patch).eq('id', me.id)).error?.message ??
      'CHANGED — this is a bug',
  )
}
```

**S6.7** — the two fields a member owns.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
console.log(
  'github:',
  (
    await supabase
      .from('profiles')
      .update({ github_url: 'https://github.com/example' })
      .eq('id', me.id)
  ).error?.message ?? 'ok',
)
console.log(
  'avatar:',
  (
    await supabase
      .from('profiles')
      .update({ avatar_url: 'https://placehold.co/200' })
      .eq('id', me.id)
  ).error?.message ?? 'ok',
)
```

**S6.8** — a manager's view of people data.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data, error } = await supabase.from('profiles').select('id, full_name, email')
console.log('profiles:', error ? 'blocked: ' + error.message : data.length + ' rows (must be 0)')
console.log(
  'public list:',
  (await supabase.from('public_members').select('full_name')).data?.length,
  'rows (must not be 0)',
)
```

**S6.9** — a request, and the two calls that decide it.

```js
// as the member
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id, phone').single()
const { error } = await supabase
  .from('profile_change_requests')
  .insert({ member_id: me.id, field: 'phone', old_value: me.phone, new_value: '9812345678' })
console.log('request:', error ? 'BLOCKED ' + error.message : 'INSERTED (expected)')
console.log(
  'decide it myself:',
  (
    await supabase
      .from('profile_change_requests')
      .update({ status: 'approved' })
      .eq('member_id', me.id)
  ).error?.message ?? 'CHANGED — this is a bug',
)
```

Then, as an admin, approve it in `/admin/profile-changes` and confirm the profile shows the new value.

**S6.17** and **S6.18** — the role function.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: member } = await supabase
  .from('profiles')
  .select('id')
  .eq('role', 'member')
  .limit(1)
  .maybeSingle()
console.log(
  'promote:',
  (await supabase.functions.invoke('change-role', { body: { user_id: member.id, role: 'admin' } }))
    .error?.message ?? 'PROMOTED — this is a bug',
)
console.log(
  'to super admin:',
  (
    await supabase.functions.invoke('change-role', {
      body: { user_id: member.id, role: 'super_admin' },
    })
  ).error?.message ?? 'PROMOTED — this is a bug',
)
```

_(Every phase now has its tests below. Add new ones at the end of the right section.)_

### Member portal walkthrough (no console needed)

| #     | Goal                                                       | Sign in as     | Steps                                                                                         | Expected                                                                                                            | Pass / Fail |
| ----- | ---------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| P6.19 | A member can upload, see the status and edit their project | member         | `/member/projects/new` → fill the form with an image → Send for approval; then open `/member` | The card shows "Waiting for review"; the image uploads into `project-images/<their uid>/`                           | ☐           |
| P6.20 | A rejection shows the reason                               | admin → member | Reject the project in `/admin/approvals` with a reason, then reload `/member`                 | The card shows "Needs changes" and the reason under "Why:"                                                          | ☐           |
| P6.21 | The edit form warns that saving re-queues                  | member         | Open `/member/projects/:id/edit`                                                              | The warning "Saving puts this back in the approval queue" is visible; saving after approval returns it to `pending` | ☐           |
| P6.22 | A member can delete their own project                      | member         | `/member` → Delete → confirm                                                                  | The card disappears; the public `/projects` page never showed it unless approved                                    | ☐           |
| P6.23 | A member cannot open someone else's project to edit        | member         | Open `/member/projects/<another member's project id>/edit`                                    | "We could not find that project", with a way back                                                                   | ☐           |
| P6.24 | Immediate profile changes work                             | member         | `/profile` → change the GitHub link; upload a photo                                           | Both save at once; the header avatar updates without a reload                                                       | ☐           |
| P6.25 | An approval-gated change travels                           | member → admin | `/profile` → Request a change → Email; then approve it in `/admin/profile-changes`            | The request shows as Waiting; after approval it is Applied and the login address is the new one                     | ☐           |
| P6.26 | One open request per field                                 | member         | Send a second request for the same field                                                      | Refused: "You already have an open request for that field."                                                         | ☐           |
| P6.27 | The header menu holds the right links                      | member         | Open the profile menu                                                                         | My projects, Upload project, Suggestion box, My profile, Log out — and **no** Admin panel for a member              | ☐           |
| P6.28 | `/member/profile` still resolves                           | member         | Open `/member/profile`                                                                        | Redirected to `/profile`                                                                                            | ☐           |

---

## 9. Phase 7 — Points, suggestions, emails, super admin

Setup first: apply `0007_points_suggestions_email.sql`, deploy all seven Edge Functions and set the
email secrets. P7.13 and P7.14 send **real email** — use test addresses only.

| #     | Goal                                                           | Sign in as                  | Steps                                                                       | Expected                                                                                                                                                        | Pass / Fail |
| ----- | -------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P7.1  | Points move the leaderboard                                    | admin                       | `/admin/points` → pick a member → Award 20 with a reason                    | Toast; the row appears as `+20` in the history; `/contributors` shows the new total                                                                             | ☐           |
| P7.2  | A deduction is a negative row, not an edit                     | admin                       | Deduct 5 with a reason                                                      | A second row, `-5`; the two rows add up                                                                                                                         | ☐           |
| P7.3  | A reason is mandatory                                          | admin                       | Award points with the reason box empty                                      | Blocked: "Say why these points are given"                                                                                                                       | ☐           |
| P7.4  | **Security:** points are admin-only                            | manager                     | Snippet S7.4                                                                | Insert REFUSED (permission denied)                                                                                                                              | ☐           |
| P7.5  | **Security:** points are a member's read-only too              | member                      | Snippet S7.4                                                                | Insert REFUSED                                                                                                                                                  | ☐           |
| P7.6  | **Security:** nobody edits or deletes points                   | admin                       | Snippet S7.6                                                                | Update 0 rows, delete 0 rows                                                                                                                                    | ☐           |
| P7.7  | Send a suggestion                                              | member                      | `/member/suggestions` → 20+ characters → Send                               | "Thank you — the team will read it"                                                                                                                             | ☐           |
| P7.8  | Too short is refused with a plain message                      | member                      | Send 5 characters                                                           | "Write at least 10 characters"                                                                                                                                  | ☐           |
| P7.9  | **Security:** the author is never exposed                      | manager                     | Snippet S7.9, then open `/admin/suggestions`                                | `author_id` refused on the table; the staff view has no such column; no name anywhere on the screen                                                             | ☐           |
| P7.10 | Read and unread toggle                                         | manager                     | `/admin/suggestions` → Mark read, then Mark unread                          | The badge flips and the unread count follows                                                                                                                    | ☐           |
| P7.11 | **Security:** the message cannot be rewritten                  | manager                     | Snippet S7.11                                                               | Only `is_read` changes: the message and the author stay as they were; no delete                                                                                 | ☐           |
| P7.12 | **Security:** the suggestion rate limit                        | member                      | Snippet S7.12 (11 inserts in one day)                                       | The 11th is refused with "Too many suggestions in one day"                                                                                                      | ☐           |
| P7.13 | Send a broadcast and see it logged                             | admin                       | `/admin/emails` → Every active member → subject + body → preview → Send now | Preview shows plain text and the count; the toast reports it; the history row says Sent                                                                         | ☐           |
| P7.14 | Send to chosen members only                                    | admin                       | Choose "Chosen members", tick two, send                                     | Only those two are addressed; the history shows the group and `2` people                                                                                        | ☐           |
| P7.15 | **Security:** a manager cannot send email                      | manager                     | Snippet S7.15                                                               | 403 "You do not have permission for that."                                                                                                                      | ☐           |
| P7.16 | **Security:** the browser cannot write the email log           | admin                       | Snippet S7.16                                                               | Insert REFUSED                                                                                                                                                  | ☐           |
| P7.17 | Promote and demote                                             | super admin                 | `/admin/roles` → change a member to Manager                                 | Confirmed; on their next load the account sees the panel                                                                                                        | ☐           |
| P7.18 | **Security:** a super admin cannot be changed from the screen  | super admin                 | `/admin/roles` → look at a Super Admin row and at your own row              | "Handled in person" / "Your own account"; no dropdown                                                                                                           | ☐           |
| P7.19 | **Security:** roles are super-admin only                       | admin                       | Open `/admin/roles`                                                         | Sent back to `/admin`; no Roles entry in the sidebar                                                                                                            | ☐           |
| P7.20 | Edit the public club details                                   | super admin                 | `/admin/settings` → change the club name → save                             | Saved; `/contact` shows the new name                                                                                                                            | ☐           |
| P7.21 | **Security:** settings are super-admin only in the UI          | admin                       | Open `/admin/settings`                                                      | Sent back; no Settings entry in the sidebar                                                                                                                     | ☐           |
| P7.22 | **Security:** the settings table is public, so nothing private | visitor                     | Snippet S7.22                                                               | Rows are readable by anyone; the page's warning is the rule for staff                                                                                           | ☐           |
| P7.23 | The sidebar matches the role matrix                            | manager, admin, super admin | Sign in as each and read the sidebar                                        | manager: no Members / Points / Emails / Membership window / Profile changes / Roles / Settings. admin: those except Roles and Settings. super admin: everything | ☐           |

### Snippets

**S7.4** — points writes by role (run it as a manager, then as a member).

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
const res = await supabase
  .from('points_log')
  .insert({ member_id: me.id, points: 10, reason: 'test', given_by: me.id })
console.log('points insert:', res.error ? 'REFUSED ' + res.error.message : 'WROTE — this is a bug')
```

**S7.6** — points are append-only, even for an admin.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: row } = await supabase.from('points_log').select('id').limit(1).maybeSingle()
const upd = await supabase.from('points_log').update({ points: 9999 }).eq('id', row.id).select()
const del = await supabase.from('points_log').delete().eq('id', row.id).select()
console.log('update:', upd.data?.length ?? 0, 'rows (must be 0)')
console.log('delete:', del.data?.length ?? 0, 'rows (must be 0)')
```

**S7.9** — the author is invisible.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
console.log(
  'author_id:',
  (await supabase.from('suggestions').select('author_id')).error?.message ??
    'READABLE — this is a bug',
)
console.log(
  'staff view:',
  (await supabase.from('staff_suggestions').select('*').limit(1)).data?.[0],
)
```

**S7.11** — "mark read" cannot become "rewrite".

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: row } = await supabase
  .from('suggestions')
  .select('id, message, is_read')
  .limit(1)
  .maybeSingle()
const upd = await supabase
  .from('suggestions')
  .update({ is_read: !row.is_read, message: 'rewritten' })
  .eq('id', row.id)
  .select()
console.log('update:', upd.error?.message ?? 'ok')
const { data: after } = await supabase
  .from('suggestions')
  .select('message, is_read')
  .eq('id', row.id)
  .single()
console.log(
  'message unchanged:',
  after.message === row.message,
  '· read toggled:',
  after.is_read !== row.is_read,
)
```

**S7.12** — the daily cap (run with care: it writes 11 rows; delete them afterwards).

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data: me } = await supabase.from('profiles').select('id').single()
for (let i = 1; i <= 11; i += 1) {
  const res = await supabase
    .from('suggestions')
    .insert({ author_id: me.id, message: `rate limit probe ${i}` })
  console.log(i, res.error ? 'refused: ' + res.error.message : 'stored')
}
```

**S7.15** and **S7.16** — who may send, and who may log.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
console.log(
  'send:',
  (
    await supabase.functions.invoke('send-email', {
      body: { group: 'all_active_members', subject: 'test', body: 'test body' },
    })
  ).error?.message ?? 'SENT — this is a bug if you are not an admin',
)
console.log(
  'log insert:',
  (await supabase.from('email_log').insert({ subject: 'x', body: 'y', recipient_group: 'test' }))
    .error?.message ?? 'WROTE — this is a bug',
)
```

**S7.22** — settings are public by design.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
console.log('settings:', (await supabase.from('settings').select('key, value')).data)
```

---

## 10. Phase 8 — Polish, accessibility, safety

These are the checks that do not need the console. Run them on the deployed site **and** once at
360px in DevTools.

| #     | Goal                                                 | Sign in as    | Steps                                                    | Expected                                                                                  | Pass / Fail |
| ----- | ---------------------------------------------------- | ------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| P8.1  | No sideways scroll at 360px, public pages            | visitor       | DevTools → 360px → visit all 11 public pages             | Nothing scrolls sideways; wide tables scroll inside their own box                         | ☐           |
| P8.2  | No sideways scroll at 360px, member and admin pages  | member, admin | Same at 360px                                            | The admin sidebar collapses to a menu button; cards stack; nothing overlaps               | ☐           |
| P8.3  | Keyboard: everything reachable, focus always visible | visitor       | Tab through Home, `/join` and the header menu            | Every control shows the cyan focus ring; the menu opens with Enter and closes with Esc    | ☐           |
| P8.4  | Light and dark parity                                | visitor       | Toggle the theme on Home, `/projects` and an admin table | Text stays readable, badges keep their meaning, the header and footer stay navy           | ☐           |
| P8.5  | Slow network                                         | visitor       | DevTools → Slow 3G → reload Home                         | A spinner or skeleton appears; the page settles with no layout jump                       | ☐           |
| P8.6  | Images: dimensions and lazy loading                  | visitor       | DevTools → Network → Img → scroll `/gallery`             | Off-screen images load as they arrive; no reflow when they do                             | ☐           |
| P8.7  | The build has no chunk-size warning                  | —             | `npm run build`                                          | No warning; `vendor-forms`, `CsvExportButton` and `introLogo` stay lazy                   | ☐           |
| P8.8  | The console is clean on the happy path               | all           | Walk every page with DevTools open                       | No errors; dev-only logging is off in the production build                                | ☐           |
| P8.9  | 404 and crash cover                                  | visitor       | Open `/nothing-here`                                     | "Page not found" with a way home                                                          | ☐           |
| P8.10 | A signed-in member sees no Join call to action       | member        | Home, then `/join`                                       | No Join button in the header, hero or join card; `/join` says "You are already a member." | ☐           |
| P8.11 | Every public page is reachable from the site itself  | visitor       | Follow the header, the footer and Home's Explore row     | All 11 public pages reachable without typing a URL                                        | ☐           |

---

## 11. The same tests, grouped by the role that runs them

Use this when you would rather stay signed in as one account than keep switching.

| Role            | Phase 1              | Phase 2-4        | Phase 5     | Phase 6                              | Phase 7                                                   | Phase 8                      | Brief 1             | Brief 2                    | Brief 4                                                  |
| --------------- | -------------------- | ---------------- | ----------- | ------------------------------------ | --------------------------------------------------------- | ---------------------------- | ------------------- | -------------------------- | -------------------------------------------------------- |
| **visitor**     | P1.4                 | P2._, P3._, P4.2 | P5.1-P5.4   | —                                    | P7.22                                                     | P8.1, P8.3-P8.6, P8.9, P8.11 | P9.1-P9.3, P9.9     | P10.3                      | P11.11                                                   |
| **member**      | P1.1-P1.3, P1.5-P1.8 | P3.*             | P5.9-P5.12  | P6.1, P6.4-P6.7, P6.10, P6.19-P6.28  | P7.5, P7.7, P7.8, P7.12                                   | P8.2, P8.10                  | P9.10               | P10.3                      | —                                                        |
| **manager**     | —                    | P4.3-P4.7        | P5.13-P5.16 | P6.8, P6.23 (blocked)                | P7.4, P7.9-P7.11, P7.15, P7.23                            | P8.2, P8.4                   | P9.5, P9.6          | P10.1, P10.2, P10.8        | —                                                        |
| **admin**       | —                    | P4.8-P4.12       | P5.17-P5.20 | P6.2, P6.3, P6.9, P6.11-P6.17, P6.20 | P7.1-P7.3, P7.6, P7.13, P7.14, P7.16, P7.19, P7.21, P7.23 | P8.2, P8.4                   | P9.4, P9.7, P9.8    | P10.4-P10.7, P10.9         | P11.1, P11.2, P11.4-P11.9, P11.11-P11.13, P11.16       |
| **super admin** | —                    | —                | —           | P6.18                                | P7.17, P7.18, P7.20, P7.23                                | P8.7, P8.8                   | —                   | P10.5                      | P11.3, P11.10, P11.11, P11.14-P11.16                    |

> The phase sections above are the source of truth; this table is only a shortcut, so a row here
> never replaces reading the test.

---

## 12. PRE-LAUNCH CHECKLIST

Everything below must be true **before real students see the site**. It is the last thing to run, after
every Pass/Fail cell above is filled in.

- [ ] Every test in sections 2-10 has been run, and every failure is either fixed or written into
      `docs/MEMORY.md` section 6 with a decision.
- [ ] **Test accounts removed or renamed.** No "Test Member" / `test.member@example.com` account is left
      active; every real account has a real name (Authentication → Users, then `public.profiles`).
- [ ] **The seed membership window is closed** — otherwise it collects applications nobody asked for:
      `sql
update public.membership_windows set is_open = false;
`
- [ ] **Seed content removed or replaced**: the fake notices, events, board members, gallery photos,
      projects and points from `supabase/seed.sql`. Check the public pages with a private window.
- [ ] **Consent wording approved.** The school has signed off on the sentence on the Join form ("My name,
      class and GitHub link may be shown on the club's public pages") and on publishing student photos.
- [ ] **A data owner is named** — a person responsible for member records, who is told when a student
      asks for their data to be corrected or removed. Recorded in `docs/HANDOVER.md`.
- [ ] **No real student PII before those two.** Until consent and the data owner exist, `profiles` holds
      only test rows.
- [ ] **Supabase Site URL** set to the Cloudflare address (Authentication → URL Configuration) and added
      to the redirect list.
- [ ] **All Edge Function secrets set** and every function deployed (`docs/OWNER-ACTIONS.md` sections 4-5);
      the service role key is nowhere in the repo, Cloudflare vars or `.env`.
- [ ] **Sender verified with the email provider** and one real test email received.
- [ ] **Development keys rotated**: the service role key, the Resend/Brevo key, and the super admin's
      first password were all typed somewhere during development.
- [ ] **Storage swept**: no leftover `probe-*` files in `gallery`, `bod-photos`, `project-images` or
      `avatars`.
- [ ] Re-run `npm run lint` and `npm run build`: both clean, and the deployed build is the one tested.
- [ ] Tag the release (`v1.0`) and hand over the accounts (`docs/HANDOVER.md`, "Who owns what").

---

## 14. Brief Step 1 — The membership form and its applications

> Needs migration `0008` applied and an open membership window (see section 6's setup for the window).

| #    | Goal                                                          | Sign in as | Steps                                                                                             | Expected                                                                                                                    | Pass / Fail |
| ---- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P9.1 | The form carries the extra questions                          | visitor    | Open `/join` with a window open and the `0008` snapshot in place                                  | Form shows full name, class, section, email, phone, GitHub link, interests (checkboxes), experience level, a reason box and the editable consent sentence | ☐           |
| P9.2 | Extra answers are stored and readable                         | visitor    | Fill the form (pick interests, choose a level, add a reason) and send; then check `/admin/applications` → **View answers** | The row appears; the modal shows every answer under its question label                                                     | ☐           |
| P9.3 | Answers land in `answers`, core in columns                     | admin      | Snippet S9.3                                                                                      | `answers` holds the extras; `full_name`/`class`/`section`/`email`/`phone`/`reason` hold the core values                     | ☐           |
| P9.4 | **Security:** the answers size check holds                     | admin      | Snippet S9.4                                                                                      | The oversized row is rejected                                                                                               | ☐           |
| P9.5 | The list filters and searches                                 | admin      | `/admin/applications`: pick a **Status** and a **Window**, type in the search box                  | Rows narrow by both filters; search still matches name, email, phone, class                                                 | ☐           |
| P9.6 | **Security:** the application CSV cannot inject               | admin      | Apply an application whose name starts with `=`, export CSV, open it                               | The cell has a leading apostrophe and shows as text, not a formula (same rule as S5.12)                                     | ☐           |
| P9.7 | An approved application becomes an account                    | admin      | Set an application to **Approved**, click **Create account**, fix any prefill, submit              | The form is prefilled (name, class, section, email, phone, GitHub); after success the temp password shows once and the row says **Created** | ☐           |
| P9.8 | A new window chooses its questions                            | admin      | `/admin/settings/membership` → **New window** → pick **Start from** a template or **Copy the last window** → save | The window stores that question snapshot                                                    | ☐           |
| P9.9 | An old window still works                                     | visitor    | Snippet S9.9, then open `/join`                                                                   | A window whose `fields` is empty still shows the default membership questions                                               | ☐           |
| P9.10 | **Security:** a visitor still cannot read the applications   | visitor    | Snippet S5.4 again                                                                                | **0 rows**                                                                                                                  | ☐           |

### Snippets (Brief 1)

**S9.3** — as staff, in the console:

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data } = await supabase
  .from('membership_applications')
  .select('full_name, class, email, reason, answers')
  .order('submitted_at', { ascending: false })
  .limit(1)
console.log(data?.[0])
```

**S9.4** — too big for the `answers` column:

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const win = (await supabase.from('membership_windows').select('id').limit(1)).data?.[0]
const { error } = await supabase.from('membership_applications').insert({
  window_id: win.id,
  full_name: 'Oversized Test',
  email: `${Date.now()}@example.com`,
  consent: true,
  answers: { blob: 'x'.repeat(9000) },
})
console.log(error ? 'BLOCKED ' + error.message : 'LEAK CHECK — should have been blocked')
```

**S9.9** — clear a window's snapshot (use a test window, never a live one):

```sql
-- in the SQL editor, on a test project
update public.membership_windows set fields = '[]'::jsonb where id = '<a test window id>';
```

Then open `/join` while that window is open: the club default questions must appear.

---

## 15. Brief Step 2 — Saved form templates

| #     | Goal                                                       | Sign in as | Steps                                                                                                   | Expected                                                                                                                     | Pass / Fail |
| ----- | ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P10.1 | The seeded templates are there                             | admin      | Open `/admin/form-templates`                                                                            | Five templates: Standard membership, Workshop registration, Competition team registration, Simple RSVP, Feedback form          | ☐           |
| P10.2 | **Security:** a manager cannot delete a template           | manager    | Open `/admin/form-templates`; check for a **Delete** button, then run S10.2                             | No Delete button, and the direct delete is refused by row level security                                                      | ☐           |
| P10.3 | **Security:** visitors and members cannot read the table   | visitor    | Snippet S10.3                                                                                           | **0 rows** (repeat signed in as a member)                                                                                     | ☐           |
| P10.4 | Rename, duplicate and archive                              | admin      | On a template use **Rename**, then **Duplicate**, then **Archive**                                      | The name changes; a "(copy)" appears with the same questions; the state flips to Archived and back                           | ☐           |
| P10.5 | Delete (admin only)                                        | admin      | On a copy, **Delete** and confirm                                                                       | It disappears from the list                                                                                                   | ☐           |
| P10.6 | Save a membership window as a template                     | admin      | `/admin/settings/membership` → **Save as template** → name it → **Save template**                       | It appears on `/admin/form-templates` under Membership                                                                       | ☐           |
| P10.7 | Start a new window from a template                         | admin      | **New window** → **Start from** that template → save                                                    | The new window's questions match the template (`select fields from membership_windows …`)                                    | ☐           |
| P10.8 | Save and reuse an event form template                      | admin      | `/admin/registration-forms` → **Save as template** on a form; then **New form** → **Start from a template** | The builder preloads that template's questions                                                                              | ☐           |
| P10.9 | Duplicate a locked form instead of editing it              | admin      | On a form with registrations, **Duplicate as a new form**, pick a different event, save                  | A second form exists with the same questions; the first never changed                                                        | ☐           |

### Snippets (Brief 2)

**S10.2** — as a manager:

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const t = (await supabase.from('form_templates').select('id').limit(1)).data?.[0]
const { error } = await supabase.from('form_templates').delete().eq('id', t.id)
console.log(error ? 'BLOCKED (expected)' : 'LEAK CHECK — a manager deleted a template')
```

**S10.3**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data, error } = await supabase.from('form_templates').select('*')
console.log(error ? 'blocked: ' + error.message : (data?.length ?? 0) + ' rows (must be 0 for a visitor or member)')
```

---

## 16. Brief Step 4 — Account creation and the staff page

> Needs migrations `0005`-`0009` applied and every function in `docs/OWNER-ACTIONS.md` section 5
> deployed. If they are not, **P11.11** explains the message you will see instead.

| #     | Goal                                                     | Sign in as  | Steps                                                                                                                    | Expected                                                                                                        | Pass / Fail |
| ----- | -------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- |
| P11.1 | Members page lists only members                          | admin       | Open `/admin/members`                                                                                                    | Every row has `role = 'member'`; no manager, admin or super admin appears                                        | ☐           |
| P11.2 | Staff page shows staff with a role badge                 | admin       | Open `/admin/staff`                                                                                                      | Manager / Admin / Super Admin badges, status and added date; no action buttons for a non-super admin             | ☐           |
| P11.3 | A super admin creates a staff account                    | super admin | `/admin/staff` → **Create staff account** → role Manager, a test email → create                                          | The temporary password shows once; the account appears with a Manager badge; `class`/`section` are empty         | ☐           |
| P11.4 | **Security:** only a super admin creates staff           | admin       | Open `/admin/staff`; look for the create button, then run S11.4                                                          | No create button; the direct call is refused (403)                                                              | ☐           |
| P11.5 | Typed passwords follow the rules                         | admin       | On **New member**, choose "Type a password" and try `short`, the person's name, the email name, then `password123`        | Each is refused with a plain reason; a good 10+ character password is accepted                                   | ☐           |
| P11.6 | The password shows once and must be changed              | admin       | Create a member, close the dialog, then run S11.6                                                                        | The password cannot be reopened; the profile shows `must_change_password = true`                                | ☐           |
| P11.7 | Phone and GitHub link are saved                          | admin       | Create a member with a phone and a GitHub link, then run S11.7                                                            | Both values are on the profile row                                                                              | ☐           |
| P11.8 | Bulk import: preview, skip, results, credentials         | admin       | `/admin/members` → **Add many members**; paste rows with a bad email, a repeat, an existing email and one missing a class | The preview marks each problem and fixing a cell clears it; confirm shows per-row results and a Credentials dialog with **Download CSV** and **Print credential slips** | ☐           |
| P11.9 | **Security:** only a super admin resets a staff password | admin       | On `/admin/staff` the reset button is hidden; run S11.9                                                                   | The direct reset of a staff account is refused (403)                                                            | ☐           |
| P11.10 | **Security:** the last super admin cannot be deactivated | super admin | Try to deactivate the only active super admin                                                                            | Refused: "This is the last active super admin…"                                                                 | ☐           |
| P11.11 | Failures are explained in plain language                | any         | Trigger each: an undeployed function (before section 5), a duplicate email, an expired session, a forbidden action        | "The account service is not reachable…", "That email already has an account", "Your session expired. Log in again.", "You are not allowed to do this." — never a stack trace or key | ☐           |
| P11.12 | Every account action is audited, with no password       | admin       | Create a member, reset a password, change a role, then run S11.12                                                         | One `audit_log` row per action, with the actor, action, target and a small detail; **no password appears anywhere** | ☐           |
| P11.13 | A failed chunk never loses the earlier passwords        | admin       | `/admin/members` → **Add many members** → add ~60 valid rows (more than two 25-row chunks), then run a second import in the same minute to trip the rate limit, or sign out in another tab mid-send | The **Credentials** dialog still shows the passwords for every account the successful chunks created; the failed rows are not shown, and a toast names the reason | ☐           |
| P11.14 | **Security:** two super admins cannot both be deactivated | super admin | With two active super admins, run S11.14 (deactivates two others at once)                                                                | Exactly one succeeds; the other is refused "This is the last active super admin…". At least one active super admin always remains | ☐           |
| P11.15 | A promoted member keeps their phone and can be demoted  | super admin | `/admin/roles`: set a member who has a phone to **Admin**, then set them back to **Member**                                                | The phone is unchanged after promotion, and the demotion succeeds                                                            | ☐           |
| P11.16 | A failed reset flag is reported, not swallowed          | admin       | Cannot be forced from the UI — the rule is in `reset-password`. Confirm in code that a failed `must_change_password` write returns "The password was changed, but the … flag was not set. Reset the password again." | The message names what happened and what to do                                                                                | ☐           |

### Snippets (Brief 4)

**S11.14** — as a **super admin**, with at least **three** active super admins (so the caller is
one and there are two others). **This deactivates the two others** — reactivate them afterwards,
or run it only on a test project.

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const me = (await supabase.auth.getUser()).data.user?.id
const { data } = await supabase.from('profiles').select('id').eq('role', 'super_admin').eq('is_active', true)
const others = (data ?? []).map((row) => row.id).filter((id) => id !== me).slice(0, 2)
console.log('deactivating', others.length, 'super admins at once')
const kill = (id) =>
  supabase.functions.invoke('set-account-status', { body: { user_id: id, is_active: false } })
const [a, b] = await Promise.all(others.map(kill))
console.log(a.error ? 'A refused: ' + a.error.context?.status : 'A allowed', '|', b.error ? 'B refused: ' + b.error.context?.status : 'B allowed')
```

Expected: one allowed, one refused (400) — never two allowed with zero active super admins left.

**S11.4** — as an **admin** (not a super admin), in the console:

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { error } = await supabase.functions.invoke('create-staff', {
  body: { role: 'manager', full_name: 'Should Fail', email: `staff${Date.now()}@example.com` },
})
console.log(error ? 'BLOCKED (expected): ' + error.context.status : 'LEAK CHECK — an admin created staff')
```

**S11.6**

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data } = await supabase
  .from('profiles')
  .select('full_name, role, class, section, must_change_password')
  .eq('role', 'member')
  .order('created_at', { ascending: false })
  .limit(1)
console.log(data?.[0])
```

**S11.7** — read the same row as S11.6 but select `phone, github_url`.

**S11.9** — as an **admin**, with a staff `user_id` (copy one from the `profiles` table):

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { error } = await supabase.functions.invoke('reset-password', {
  body: { user_id: '<a manager or admin uuid>' },
})
console.log(error ? 'BLOCKED (expected): ' + error.context.status : 'LEAK CHECK — an admin reset staff')
```

**S11.12** — as an **admin** or super admin:

```js
const { supabase } = await import('/src/lib/supabaseClient.js')
const { data } = await supabase
  .from('audit_log')
  .select('action, actor_role, target_email, detail, created_at')
  .order('created_at', { ascending: false })
  .limit(10)
console.table(data)
```

Expected: recent rows for `member.create`, `account.reset_password`, `role.change`, `member.bulk_create`, `staff.create`, `account.set_status`. No `password` key in any `detail`.

---

## 17. Adding the next phase

When a future phase adds a feature, add a `## 18. Phase 10 — …` style section here with the same
table shape, keep the numbering pattern (`P12.1`, `S12.1`), and add its column to section 11. Do
not renumber the earlier phases: testers may have already written results against them.

> Sections 14-16 follow that rule: **14** is the membership-form brief's Step 1, **15** its Step 2
> (templates), **16** its Step 4 (accounts). Run them after section 6, once `0008` and `0009` are
> applied.

