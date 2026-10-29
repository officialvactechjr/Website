# HANDOVER.md: for next year's committee

Written in plain language, on purpose. If you have just been handed this website, read this
first, then `README.md`. Nothing here assumes you are a programmer.

---

## 1. What this is

A website for the club with two halves:

- **What visitors see:** home, notices, events, the board of directors, the photo gallery,
  member projects, the points leaderboard, the member list, the join form and the contact page.
- **What signed-in people see:** members can upload projects, ask for a profile change and send
  an anonymous suggestion; the club team gets an admin panel to run all of it.

Nobody can sign themselves up. The club team creates every account and hands over the password
in person. That is a decision, not a missing feature: it keeps the site free of strangers and
fits how a school club actually works.

## 2. The five accounts, and who should hold them

| Account                          | What it is for                          | Who should hold it                                  |
| -------------------------------- | --------------------------------------- | --------------------------------------------------- |
| **GitHub** (`officialvactechjr`) | the code lives here                     | the club account, plus the teacher in charge        |
| **Supabase**                     | the database, logins and file storage   | the club account; the Super Admin added as a member |
| **Cloudflare Pages**             | serves the website                      | the club account                                    |
| **Resend** (or Brevo)            | sends the club's email                  | the club account                                    |
| **The club email address**       | every account above is registered to it | club owner + teacher in charge                      |

Two rules that protect the club:

1. **Nothing personal.** Every account is registered to the club's email, never to a student's.
2. **Two people know each password.** The club owner and the teacher in charge. If only one
   person knows, one graduation locks everybody out.

## 3. The four roles, and what each can do

| Role            | Who                  | Can do                                                                                                                                                     |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Member**      | students in the club | upload projects, edit or delete their own, ask for a profile change, send suggestions                                                                      |
| **Manager**     | the web manager      | everything above plus notices, events, board, gallery, registration forms, project approvals, registrations, membership applications, the suggestion inbox |
| **Admin**       | the club president   | everything a Manager can, plus create accounts, reset passwords, deactivate accounts, points, email, the membership window, profile change requests        |
| **Super Admin** | institution staff    | everything, plus changing roles and the site settings                                                                                                      |

A member never sees the admin panel; staff get an "Admin panel" link in their profile menu.

## 4. The things you will actually do

**A new student wants to join.** They fill in the form on `/join` **only while the membership
window is open**. You open the window in Admin panel → Membership window, and it closes by
itself at the time you set. Applications appear in Membership applications; you can export them
to a spreadsheet.

**Approve someone, then give them an account.** Admin panel → Members → New member. The email
and a temporary password appear **once** — write them down and hand them over in person the same
day. The member chooses their own password at first login.

**Many accounts at once.** Same page → download the CSV template, fill it in with two columns
(name, email), import. You get a per-row result, and duplicates are reported rather than
silently skipped.

**Approve a project.** Admin panel → Project approvals. Approve, or reject with a written reason
— the student sees that reason on their own page. If they then edit the project, it comes back to
you automatically for another look.

**Announce something.** Notices → New notice. It stays hidden until the publish time; pin it to
keep it at the top.

**Give points.** Points → pick the member, award or deduct, and write why. Points are permanent:
a mistake is fixed with a new, opposite row, never by editing. The Top contributors page reads
the totals.

**Read the suggestion box.** Suggestions shows every message with no name attached — the site
stores the sender privately for abuse control, but no screen, export or database view can show it,
by design. Mark them read as you go.

**Email everybody.** Emails → choose "Every active member", preview exactly what will be sent,
send. One dispatch reaches 100 people; the club is smaller than that, so one press is enough.
Every send is listed in the history below.

**A student changes their name, class, section, email or phone.** They ask for it on `/profile`.
Staff approve or reject it in Profile changes. Nothing else can change those five fields — not
even the students themselves, and not an Admin by hand, because a change of login email has to
happen in two places at once and the website does it safely.

## 5. If something goes wrong

| What you see                           | What it usually means                                            | What to do                                                                        |
| -------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| "We could not load…" everywhere        | the internet or Supabase is down, or a migration was not applied | check supabase.com → Project status, then `docs/OWNER-ACTIONS.md`                 |
| A member cannot log in                 | account deactivated, or the password is the old temporary one    | Members → check Activate / reset their password                                   |
| "You do not have permission for that." | that screen belongs to a different role                          | check the role on Members, then Roles                                             |
| Emails do not arrive                   | sender not verified, or the key expired                          | `docs/OWNER-ACTIONS.md` section 6; check the dispatch history for a Failed row    |
| A page shows "Page not found"          | the address is wrong, or the page was removed                    | go back to Home; the footer links every public page                               |
| Something crashed                      | a bug                                                            | take a screenshot, note the address, and report it with `docs/TESTING.md` in hand |

## 6. Before real students' names go in

Three things, all of them somebody's job:

1. **The test pass is done.** `docs/TESTING.md`, Phase 1 to Phase 8, every row Pass or explained.
2. **The school has approved the consent sentence** on the join form ("My name, class and GitHub
   link may be shown on the club's public pages") and publishing student photos.
3. **A data owner is named** — one person who is responsible for member records and who is told
   when a student asks for their data to be corrected or removed.

Until all three are true, the database holds only the fake sample rows.

## 7. Handing over year after year

- Keep `docs/MEMORY.md` up to date. It is the project's memory: what was built, what was decided
  and why, and what is still open. Every future assistant reads it first.
- Keep the four accounts on the club's email, never a student's personal one.
- A new Super Admin is created **by hand in Supabase** (see `docs/OWNER-ACTIONS.md` section 3) —
  the website cannot do it on purpose, so nobody can promote themselves.
- When something breaks and you fix it, write one line in `docs/MEMORY.md` section 7. The next
  committee will thank you.

## 8. Where every document lives

| File                           | Read it when                                          |
| ------------------------------ | ----------------------------------------------------- |
| `README.md`                    | you are setting up, deploying or doing a routine task |
| `docs/HANDOVER.md` (this file) | you have just taken over                              |
| `docs/PRD.md`                  | you want to know what the site is meant to do         |
| `docs/ARCHITECTURE.md`         | you are changing how it is built                      |
| `docs/DESIGN.md`               | you are changing how it looks                         |
| `docs/PHASES.md`               | you want the build history by phase                   |
| `docs/TESTING.md`              | you are testing, or launching                         |
| `docs/OWNER-ACTIONS.md`        | something needs a database, secret or deploy step     |
| `docs/MEMORY.md`               | always last — it says where the project stands today  |
