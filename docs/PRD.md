# PRD: VAC Tech Jr Website

**Product Requirements Document**
Project: Official website and member platform for VAC Tech Jr, the IT Club of Vishwa Adarsha Academy (+2)
Status: Pre-development
Stack: React (Vite) + Tailwind CSS + Supabase + Cloudflare Pages

> Read order for any developer or AI: `PRD.md` → `ARCHITECTURE.md` → `DESIGN.md` → `PHASES.md` → `MEMORY.md` (always last, it shows the current state).

---

## 1. Purpose

A single digital home for the club. It must:

1. Introduce the club to students, teachers and visitors.
2. Publish notices, events, workshops, photos and the BOD showcase.
3. Showcase member projects (only after approval).
4. Let the club team manage registrations, members, uploads and emails in one place.

## 2. Goals and non-goals

**Goals**
- Public pages load fast on mobile and on slow Nepali networks.
- Only the club team can create accounts. Nobody can sign up on their own.
- Every member upload is reviewed before it goes public.
- The site can survive leadership changes with no code edits (Super Admin handles roles).

**Non-goals (not in version 1)**
- Public sign-up or social login
- Chat, comments or likes
- Payments
- A native mobile app
- Automatic ranking from GitHub activity (manual points only for now)

## 3. Users and roles

| Role | Who | Can do |
|---|---|---|
| Visitor | Anyone | Read public pages, submit membership application, register for events |
| Member | Club members (about 50-60) | Log in, upload projects, see upload status, edit or delete own uploads, send suggestions |
| Manager | Web manager | Manage notices, events, BOD, gallery; approve or reject uploads; view and export registrations |
| Admin | Club President | Everything a Manager can, plus create member accounts, reset passwords, deactivate accounts, send emails, give points, open or close the membership window |
| Super Admin | Staff member of the institution | Everything, plus add or remove Admins and Managers and change system settings |

## 4. Authentication requirements (decided)

- There is **one Login page** and nothing else for authentication. No sign-up page, no "forgot password via self-service" in v1.
- The club team creates every account and **hands the email and temporary password to the person personally**.
- Supabase **email sign-ups are disabled**. Accounts are created only through a server-side function that uses the service role key.
- On first login the user **must change the password** before using anything else.
- Admin can **reset a password** (generate a new temporary one) or **deactivate** an account. A deactivated user is blocked even if they hold a valid session.
- After login, the user is routed by role: Member → `/` (the public site), Manager/Admin/Super Admin → `/admin`.
- Visitors and members see **the same public pages and the same UI**. Member-only pages (`/profile`, `/member/*`) are extra pages on that same site, not a separate area, and they use the public header and footer.
- Members never see `/admin`. Staff get an "Admin panel" link inside their profile menu.
- While logged in the header shows a **profile button** (photo, or initials when there is no photo) in place of "Member login", and the "Join the club" button is hidden. The menu holds: My profile, My projects, Upload project, Suggestion box, Admin panel (staff only), Log out.
- The session lives until the user logs out.
- Public visitors never see the login in the main navigation clutter. A small "Member Login" link in the navbar or footer is enough.

## 5. Functional requirements

IDs are used in `PHASES.md` and `MEMORY.md` for tracking.

### 5.1 Public pages (no login)

| ID | Feature | Details |
|---|---|---|
| PUB-01 | Home | Club intro, goals, highlights (latest notice, next event, a few projects) |
| PUB-02 | Notices | List with pinned notices first; detail page |
| PUB-03 | Events | Upcoming and past (archive); detail page with registration form when open |
| PUB-04 | BOD Showcase | Photos, positions, short bios, by term year |
| PUB-05 | Photo Gallery | Grid with caption, optional event filter, lightbox |
| PUB-06 | Member Projects | Approved only; shows title, image, description, student name, class, section, GitHub link |
| PUB-07 | Top Contributors | Ranking from points |
| PUB-08 | Member List | Name, class, GitHub only |
| PUB-09 | Membership Registration | Visible only while the window is open; closes automatically |
| PUB-10 | Event Registration | Rendered from the event's form definition; closes automatically |
| PUB-11 | Contact | Email, location, social links, optional message form |

### 5.2 Member area

| ID | Feature | Details |
|---|---|---|
| MEM-01 | Login | Email + password provided by the club |
| MEM-02 | Forced password change | On first login |
| MEM-03 | Upload project | Title, description, image, GitHub link; saved as `pending` |
| MEM-04 | Upload status | Pending, approved or rejected (with reason) |
| MEM-05 | Edit or delete own uploads | Editing an approved project sends it back to `pending` |
| MEM-06 | Suggestion box | Send ideas or complaints |
| MEM-07 | Profile (`/profile`) | Change password immediately. GitHub link and photo change immediately. Email, phone, name, class and section are **submitted as change requests** that an admin must approve before they take effect. |

### 5.3 Admin and Manager panel

| ID | Feature | Roles |
|---|---|---|
| ADM-01 | CRUD notices | Manager, Admin, Super Admin |
| ADM-02 | CRUD events | Manager, Admin, Super Admin |
| ADM-03 | CRUD BOD members | Manager, Admin, Super Admin |
| ADM-04 | CRUD gallery photos | Manager, Admin, Super Admin |
| ADM-05 | Event registration form builder (template, open/close time) | Manager, Admin, Super Admin |
| ADM-06 | View and CSV-export event registrations and membership applications | Manager, Admin, Super Admin |
| ADM-07 | Approve or reject projects (rejection needs a reason) | Manager, Admin, Super Admin |
| ADM-08 | Create member accounts (single form) | Admin, Super Admin |
| ADM-09 | Bulk create accounts from CSV | Admin, Super Admin |
| ADM-10 | Reset password, deactivate or reactivate account | Admin, Super Admin |
| ADM-11 | Give points to members | Admin, Super Admin (Manager optional) |
| ADM-12 | Read suggestions | Manager, Admin, Super Admin |
| ADM-13 | Send emails | Admin, Super Admin |
| ADM-14 | Open or close membership window | Admin, Super Admin |
| ADM-15 | Dashboard (pending counts, recent activity) | All staff roles |
| ADM-16 | Review profile change requests: approve or reject with a note | Admin, Super Admin |

### 5.4 Super Admin extras

| ID | Feature |
|---|---|
| SUP-01 | Add or remove Admins and Managers (change roles) |
| SUP-02 | System-wide settings (site name, contact details, social links). Editable by **Admin and Super Admin** only. The settings table is publicly readable, so it must never hold private values. |

## 6. Business rules

1. Only `approved` projects are visible publicly. `pending` and `rejected` are visible only to the owner and staff.
2. A member can never change their own role, status or points.
3. Event and membership forms accept submissions only between `opens_at` and `closes_at`. This is enforced in the database, not only in the UI.
4. Public pages expose **name, class and GitHub only**. Never phone, email or private details.
5. Passwords are never visible to anyone, including admins. Admins can only reset them.
6. Every staff action that changes data should record who did it (`created_by`, `reviewed_by`, `given_by`).
7. Rejecting a project requires a written reason shown to the member.
8. A member can never write `email`, `phone`, `full_name`, `class` or `section` directly. Those changes go through `profile_change_requests` and are applied by an Admin or Super Admin. This is enforced in the database, not only in the UI.
9. `email` and `phone` are private. They must never appear on a public page, a public view or in seed data.
10. Applying an approved **email** change goes through an Edge Function with the service role key; nothing else may write `profiles.email`.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Public pages usable on 3G; images resized before upload (max about 1600px, under 1 MB target) |
| Responsive | Mobile first; works from 360px wide |
| Security | RLS on every table; no secrets in frontend; service role key only in Edge Functions |
| Accessibility | Keyboard navigable, visible focus, alt text, sufficient contrast |
| Maintainability | Simple tools, all SQL in migration files, handover guide |
| Cost | Free tiers only (Supabase, Cloudflare Pages, Resend or Brevo) |

## 8. Data privacy and consent

- A consent line on the membership form: name, class and GitHub may be shown publicly.
- Photos of students need school or guardian permission before publishing.
- Suggestion box: **anonymous to readers**. The admin UI never shows the author. State this honestly on the form.

## 9. Decisions log

| Question from the original doc | Decision |
|---|---|
| How members log in | Email + password issued by the club; single Login page; no sign-up |
| Application → account | Manual: team approves, then creates the account with a prefilled form |
| Suggestion box | Anonymous to readers |
| Ranking | Manual points only in v1 |
| Website address | Free Cloudflare Pages address first (`officialvactechjr/Website`); custom domain later |
| Super Admin | A teacher or IT staff member, to be agreed in writing (OPEN) |
| Public display permission | Consent line on form + school permission for photos (OPEN: get written approval) |

## 10. Open items

- [ ] Name the Super Admin (institution staff)
- [ ] Get written permission for showing names, photos and work
- [ ] Choose email provider (Resend or Brevo) and sender address
- [ ] Final club logo and brand colors (see `DESIGN.md`)
- [x] Create the official club GitHub, Supabase and Cloudflare Pages accounts (not personal)

## 11. Success criteria

- A visitor can find the next event and register in under 1 minute on a phone.
- The team can add a notice in under 1 minute.
- A member can upload a project and see its status without help.
- No unapproved content ever appears publicly.
- A new President can run the site using only the handover guide.
