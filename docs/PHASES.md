# PHASES.md: Build Plan by Phase and Page

Work is split into **phases and pages**, not weeks. Finish a phase's checklist before starting the next. Mark items with `[x]` here and mirror progress in `MEMORY.md`.

Requirement IDs (PUB-01, ADM-05, etc.) come from `PRD.md`.

```mermaid
flowchart LR
    P0[Phase 0<br/>Setup] --> P1[Phase 1<br/>Auth + Shell]
    P1 --> P2[Phase 2<br/>Public pages A]
    P2 --> P3[Phase 3<br/>Public pages B]
    P3 --> P4[Phase 4<br/>Admin core]
    P4 --> P5[Phase 5<br/>Registrations]
    P5 --> P6[Phase 6<br/>Members + Projects]
    P6 --> P7[Phase 7<br/>Points, Suggestions, Email, Super Admin]
    P7 --> P8[Phase 8<br/>Test, Launch, Handover]
```

> The public site can go live after **Phase 3**, while the admin and member systems are still being built.

---

## Phase 0: Project Setup

**Goal:** an empty app that runs, deploys and connects to Supabase.

- [x] Create official club GitHub, Supabase and Cloudflare Pages accounts
- [x] `npm create vite@latest` (React), install approved libraries
- [x] Configure Tailwind with tokens from `DESIGN.md`
- [x] Create folder structure from `ARCHITECTURE.md` section 9
- [x] `lib/supabaseClient.js`, `.env.example`, `.gitignore`
- [x] ESLint + Prettier
- [x] SPA fallback; first deploy of a blank page (Cloudflare Pages; `vercel.json` is unused)
- [x] Copy `docs/` files into the repo

**Done when:** the deployed URL shows a placeholder page and the Supabase client connects.

---

## Phase 1: Auth, Roles and App Shell

**Goal:** login works, roles work, layouts exist.

**Database (migration 0001)**
- [x] `profiles` table, role enum, `is_active`, `must_change_password`
- [x] Helper function `current_role()`
- [x] RLS on `profiles`; protect role/active columns
- [x] Disable email sign-ups in Supabase Auth settings
- [x] Create the first Super Admin manually in the dashboard
- [x] Migration `0001` applied to the live Supabase project

**Pages and components**
- [x] `/login`: Login page (email + password only)
- [x] `/change-password`: forced password change page
- [x] `AuthContext` (session, profile, role)
- [x] `ProtectedRoute` with role checks
- [x] `PublicLayout` (Navbar + Footer), `AdminLayout` (sidebar)
- [x] `NotFound`, Error Boundary
- [x] Base `components/ui`: Button, Input, Card, Modal, Badge, Spinner, EmptyState, ErrorState
- [x] Dark/light theme toggle

**Done when:** a manually created user can log in, is forced to change the password, lands on the right placeholder area by role, and a deactivated user is blocked.

> Done. Verified against the live project: a member cannot change their own `role`, name, class or
> section and cannot write notices, while an admin can (see `MEMORY.md` section 6 item 13).
> `MemberLayout` was dropped in step 2.2 — member pages live inside the public layout.

---

## Phase 2: Public Pages, Part A (content basics)

**Goal:** the first real content people see, behind the intro animation.

**Shell (2.1-2.2)**
- [x] Intro animation ported to `src/components/shared/IntroAnimation.jsx` (step 2.1)
- [x] Header switches by session: profile button + menu when logged in, "Member login" + "Join the club" when logged out
- [x] Footer: 3 columns, every public page reachable
- [x] `/profile` (MEM-07): password change only for now — the change requests arrive in Phase 6
- [x] Members land on `/` after login; staff still land on `/admin`

**Database (migration 0002)**
- [x] `notices`, `events`, `settings` tables with RLS (public read gated by RLS, staff write) — applied, plus `seed.sql`
- [x] `0002`'s read policies keep drafts in: notices only once `published_at <= now()`, events only when `status` is `published` or `cancelled`
- [x] `0003_profiles_protection.sql`: only an admin may change `full_name`, `class` or `section`

**Pages**
- [x] `/`: **Home** (PUB-01): hero with `HeroVisual` and "View about" / "Join the club", What the club does (`#about`), Notices, Events, Explore links, Join card
- [x] `/notices`: **Notices list** (PUB-02), pinned first
- [x] `/notices/:id`: **Notice detail**
- [x] `/events`: **Events list** (PUB-03): upcoming and archive tabs
- [x] `/events/:id`: **Event detail** (registration area added in Phase 5)
- [x] `/contact`: **Contact** (PUB-11)
- [x] `/join`: **closed state** for now (PUB-09 form is Phase 5)
- [x] Route-level `React.lazy()` + `Suspense` so the first bundle stays small

**Close-out (2.5)**
- [x] `DESIGN.md` final pass: tokens, components, imagery, motion, and the accessibility checklist turned into a checked record
- [x] **Light-theme contrast check DONE** (2026-10-19): four light status colours darkened to pass WCAG AA as text
- [x] Second review pass: the input focus ring restored, touch-target numbers corrected, the duplicated token block replaced with a pointer

> Home's Projects / Top contributors / BOD previews are the **first Phase 3 tasks** — their tables arrive with migration 0004.

> **Step 2.5 is done** (2026-10-19): the `DESIGN.md` pass and the light-theme contrast check are
> complete, and four light-theme status colours were darkened to pass WCAG AA. **Phase 2 is closed.**
> The public site can go live here; Home's Projects / Top contributors / BOD previews are the first
> Phase 3 tasks.

**Done when:** all six pages work on mobile with loading, error and empty states.

---

## Phase 3: Public Pages, Part B (people and showcase)

**Database (migration 0004)**
- [ ] `bod_members`, `gallery_photos`, `projects`, `points_log` tables
- [ ] Views: `public_members`, `public_projects`, `leaderboard`
- [ ] Storage buckets: `gallery`, `bod-photos`, `project-images`, `avatars`

**Pages**
- [ ] `/bod`: **BOD Showcase** (PUB-04)
- [ ] `/gallery`: **Photo Gallery** (PUB-05) with lightbox
- [ ] `/projects`: **Member Projects** (PUB-06), approved only
- [ ] `/projects/:id`: **Project detail**
- [ ] `/contributors`: **Top Contributors** (PUB-07)
- [ ] `/members`: **Member List** (PUB-08)

**Done when:** public site is complete with seed data. **Safe point to launch the public site.**

---

## Phase 4: Admin Panel Core

**Goal:** staff can manage content without touching the database.

**Pages**
- [ ] `/admin`: **Dashboard** (ADM-15): counts, recent activity
- [ ] `/admin/notices`: **Notices** CRUD (ADM-01)
- [ ] `/admin/events`: **Events** CRUD (ADM-02)
- [ ] `/admin/bod`: **BOD** CRUD (ADM-03)
- [ ] `/admin/gallery`: **Gallery** CRUD with multi-image upload (ADM-04)

**Shared pieces**
- [ ] Reusable `DataTable` (search, sort, pagination)
- [ ] Reusable `ImageUpload` (resize, size limit, preview)
- [ ] `ConfirmDialog` for deletes

**Done when:** a Manager can add, edit and delete content in all four areas and it appears publicly.

---

## Phase 5: Registrations

**Database (migration 0005)**
- [ ] `membership_windows`, `membership_applications`, `registration_forms`, `event_registrations`
- [ ] RLS: public insert only inside the open window

**Pages**
- [ ] `/join`: **Membership form** (PUB-09) with consent checkbox, auto closed message
- [ ] Event detail: **Event registration form** (PUB-10) rendered from JSON via `DynamicForm`
- [ ] `/admin/registration-forms`: **Form builder** (ADM-05): template questions, toggle on/off, open and close time
- [ ] `/admin/registrations`: **Event registrations** list and CSV export (ADM-06)
- [ ] `/admin/applications`: **Membership applications** list, status, CSV export (ADM-06)
- [ ] `/admin/settings/membership`: **Open or close membership window** (ADM-14)

**Done when:** forms accept entries only inside the window (verified by trying to bypass the UI) and staff can export.

---

## Phase 6: Members and Projects

**Database (migration 0006 projects flow + 0007 profile changes)**
- [ ] RLS for `projects` (owner CRUD, staff review), status flow, `review_note`
- [ ] `profile_change_requests` table + RLS
- [ ] `profiles.phone`, and protection so a member cannot write `email`, `phone`, `full_name`, `class` or `section` directly

**Edge Functions**
- [ ] `create-member`, `bulk-create-members`, `reset-password`
- [ ] `apply-profile-change` — applies an approved email change with the service role key

**Admin pages**
- [ ] `/admin/members`: **Members list**: create one (ADM-08), CSV import (ADM-09), reset password, deactivate or reactivate (ADM-10)
- [ ] `/admin/approvals`: **Project approvals** (ADM-07) with reject reason
- [ ] `/admin/profile-requests`: **Profile change requests** (ADM-16): approve or reject with a note

**Member pages**
- [ ] `/member`: **My projects** (MEM-04)
- [ ] `/member/projects/new`: **Upload project** (MEM-03)
- [ ] `/member/projects/:id/edit`: **Edit project** (MEM-05), resubmits to pending
- [ ] `/profile`: **Profile** (MEM-07): password, immediate fields, change requests
- [ ] `/member/profile`: replaced by `/profile` (MEM-07)

**Done when:** the full cycle works: create member → login → upload → approve → appears on `/projects`.

---

## Phase 7: Points, Suggestions, Emails, Super Admin

**Database (migration 0008)**
- [ ] `suggestions`, `email_log` tables and RLS

**Pages and functions**
- [ ] `/admin/points`: **Give points** (ADM-11) → leaderboard updates
- [ ] `/member/suggestions`: **Suggestion box** (MEM-06), anonymous to readers
- [ ] `/admin/suggestions`: **Read suggestions** (ADM-12)
- [ ] `send-email` Edge Function + `/admin/emails`: **Send emails** (ADM-13), log every send
- [ ] `/admin/roles`: **Manage Admins and Managers** (SUP-01)
- [ ] `/admin/settings`: **System settings** (SUP-02)

**Done when:** every PRD feature exists and each role sees only what it should.

---

## Phase 8: Testing, Launch and Handover

- [ ] RLS test sweep: logged out, member, manager, admin, super admin (table by table)
- [ ] Try to bypass: edit role from the console, submit after window closes, read pending projects
- [ ] Mobile pass at 360px, slow network test
- [ ] Accessibility pass (keyboard, contrast, alt text)
- [ ] Test with 5 to 10 real students; collect and fix feedback
- [ ] Remove seed/fake data; add real content
- [ ] Rotate any keys used during development
- [ ] Write handover `README.md`: run locally, deploy, add notice, create member, change roles, where accounts live
- [ ] Transfer ownership: club accounts, Super Admin as co-owner
- [ ] Tag release `v1.0`

**Done when:** a new President could run the site using only the README.

---

## Backlog (after v1, not now)

- Automatic points rules (e.g. +10 per approved project)
- Self-service password reset by email
- Notice and event email subscriptions
- Search across the site
- Analytics (privacy-friendly)
