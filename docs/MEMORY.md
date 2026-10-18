# MEMORY.md: Project Progress and Resume Point

**This file is the project's living memory.** Anyone (human or AI) returning after a break reads this file first, then `PHASES.md`, then `ARCHITECTURE.md`.

> **Update rule:** at the end of EVERY working session, update sections 1, 2, 3 and 7. Keep entries short and factual. Never delete history; add to it.

---

## 1. Current status (update every session)

| Field | Value |
|---|---|
| Last updated | 2026-10-18 |
| Current phase | Phase 2: Public Pages A |
| Current task | Steps 2.1-2.3 done. Step 2.4 (remaining public pages) next |
| File(s) being worked on | `src/pages/public/Home.jsx`, `src/features/{notices,events}/`, `supabase/migrations/0002_content_tables.sql` |
| Overall progress | 0 of 9 phases complete (Phases 0-1 code done; Phase 2 mostly done — 5 of 6 pages) |
| Blocked by | Migrations `0001` and `0002` must be applied to the real Supabase project, or Home's notices/events show their error state |

## 2. Resume here (the single most important section)

> Write 2 to 5 lines so a person or AI can continue immediately.

- **Last thing done:** Step 2.3. Home is the new landing page: centred `HeroVisual` (placeholder SVG in one swappable component), "View about" (smooth scroll to `#about`) and "Join the club" (hidden when logged in), What the club does, Notices, Events, an Explore links row, and the Join card (hidden when logged in, says "Registration opens soon"). Migration `0002` and the `notices`/`events` data layer (api + hooks + list/row components) are in place; TanStack Query is wired up.
- **Next thing to do:** **Apply migrations `0001` and `0002`** in the Supabase SQL editor — the project is live but the tables are missing, so Home shows error states. Then step 2.4: `/notices`, `/notices/:id`, `/events`, `/events/:id`, `/contact`. The Phase 1 end-to-end login test can finally run too.
- **Watch out for:** `src/routes/MemberLayout.jsx` is unused (kept per the no-delete rule); `notices`/`events` were only exercised without tables, so their success state is unverified.

## 3. Phase tracker

Status values: `not started`, `in progress`, `done`, `blocked`.

| Phase | Name | Status | Started | Finished | Notes |
|---|---|---|---|---|---|
| 0 | Project Setup | in progress | 2026-10-18 | | Code done; blocked on club accounts + first deploy |
| 1 | Auth, Roles and App Shell | in progress | 2026-10-18 | | Code done; login test + Super Admin need the Supabase project |
| 2 | Public Pages A (Home, Notices, Events, Contact) | in progress | 2026-10-18 | | 2.1-2.3 done (intro, shell, Home). 2.4 left: notices, events, contact pages |
| 3 | Public Pages B (BOD, Gallery, Projects, Contributors, Members) | not started | | | Public site can launch here |
| 4 | Admin Panel Core | not started | | | |
| 5 | Registrations | not started | | | |
| 6 | Members and Projects | not started | | | |
| 7 | Points, Suggestions, Emails, Super Admin | not started | | | |
| 8 | Testing, Launch, Handover | not started | | | |

## 4. Page and file tracker

Update the status as each page is built. Statuses: `todo`, `wip`, `done`, `needs-fix`.

### Public pages
| Route | File | Req ID | Status |
|---|---|---|---|
| `/` | `src/pages/public/Home.jsx` | PUB-01 | todo |
| `/notices` | `src/pages/public/Notices.jsx` | PUB-02 | todo |
| `/notices/:id` | `src/pages/public/NoticeDetail.jsx` | PUB-02 | todo |
| `/events` | `src/pages/public/Events.jsx` | PUB-03 | todo |
| `/events/:id` | `src/pages/public/EventDetail.jsx` | PUB-03, PUB-10 | todo |
| `/bod` | `src/pages/public/Bod.jsx` | PUB-04 | todo |
| `/gallery` | `src/pages/public/Gallery.jsx` | PUB-05 | todo |
| `/projects` | `src/pages/public/Projects.jsx` | PUB-06 | todo |
| `/projects/:id` | `src/pages/public/ProjectDetail.jsx` | PUB-06 | todo |
| `/contributors` | `src/pages/public/Contributors.jsx` | PUB-07 | todo |
| `/members` | `src/pages/public/Members.jsx` | PUB-08 | todo |
| `/join` | `src/pages/public/Join.jsx` | PUB-09 | todo |
| `/contact` | `src/pages/public/Contact.jsx` | PUB-11 | todo |

### Auth
| Route | File | Req ID | Status |
|---|---|---|---|
| `/login` | `src/features/auth/LoginPage.jsx` | MEM-01 | done |
| `/change-password` | `src/features/auth/ChangePasswordPage.jsx` | MEM-02 | done |

### Member pages
| Route | File | Req ID | Status |
|---|---|---|---|
| `/member` | `src/pages/member/Dashboard.jsx` | MEM-04 | todo |
| `/member/projects/new` | `src/pages/member/UploadProject.jsx` | MEM-03 | todo |
| `/member/projects/:id/edit` | `src/pages/member/EditProject.jsx` | MEM-05 | todo |
| `/member/suggestions` | `src/pages/member/Suggestions.jsx` | MEM-06 | todo |
| `/profile` | `src/pages/member/Profile.jsx` | MEM-07 | wip |

### Admin pages
| Route | File | Req ID | Status |
|---|---|---|---|
| `/admin` | `src/pages/admin/Dashboard.jsx` | ADM-15 | todo |
| `/admin/notices` | `src/pages/admin/NoticesAdmin.jsx` | ADM-01 | todo |
| `/admin/events` | `src/pages/admin/EventsAdmin.jsx` | ADM-02 | todo |
| `/admin/bod` | `src/pages/admin/BodAdmin.jsx` | ADM-03 | todo |
| `/admin/gallery` | `src/pages/admin/GalleryAdmin.jsx` | ADM-04 | todo |
| `/admin/registration-forms` | `src/pages/admin/FormBuilder.jsx` | ADM-05 | todo |
| `/admin/registrations` | `src/pages/admin/Registrations.jsx` | ADM-06 | todo |
| `/admin/applications` | `src/pages/admin/Applications.jsx` | ADM-06 | todo |
| `/admin/approvals` | `src/pages/admin/Approvals.jsx` | ADM-07 | todo |
| `/admin/profile-requests` | `src/pages/admin/ProfileRequests.jsx` | ADM-16 | todo |
| `/admin/members` | `src/pages/admin/MembersAdmin.jsx` | ADM-08, 09, 10 | todo |
| `/admin/points` | `src/pages/admin/Points.jsx` | ADM-11 | todo |
| `/admin/suggestions` | `src/pages/admin/SuggestionsAdmin.jsx` | ADM-12 | todo |
| `/admin/emails` | `src/pages/admin/Emails.jsx` | ADM-13 | todo |
| `/admin/settings/membership` | `src/pages/admin/MembershipWindow.jsx` | ADM-14 | todo |
| `/admin/roles` | `src/pages/admin/Roles.jsx` | SUP-01 | todo |
| `/admin/settings` | `src/pages/admin/Settings.jsx` | SUP-02 | todo |

### Database migrations
| File | Purpose | Written | Applied |
|---|---|---|---|
| `0001_profiles_roles.sql` | profiles, roles, helpers, RLS | yes | yes |
| `0002_content_tables.sql` | notices, events, settings (public read gated by RLS) | yes | no |
| `0003_profiles_protection.sql` | name/class/section need an admin; `protect_profile_columns` replaced | yes | no |
| `0004_showcase_tables.sql` | BOD, gallery, projects, points, views, buckets | no | no |
| `0005_registrations.sql` | windows, applications, forms, event registrations | no | no |
| `0006_projects_flow.sql` | project status flow policies | no | no |
| `0007_profile_changes.sql` | `profile_change_requests`, `profiles.phone` | no | no |
| `0008_suggestions_email.sql` | suggestions, email_log | no | no |

### Edge Functions
| Function | Purpose | Status |
|---|---|---|
| `create-member` | Create one account | todo |
| `bulk-create-members` | CSV import | todo |
| `reset-password` | Generate a new temp password | todo |
| `send-email` | Send mail through provider | todo |

## 5. Decisions made (do not change without asking the owner)

| Date | Decision |
|---|---|
| _set at project start_ | Stack: React + Vite, Tailwind, React Router, TanStack Query, RHF + Zod, Supabase, Vercel |
| _set at project start_ | Login: single Login page, email + password handed out personally by the club; no sign-up; email sign-ups disabled |
| _set at project start_ | First login forces a password change |
| _set at project start_ | Suggestion box is anonymous to readers |
| _set at project start_ | Ranking uses manual points only in v1 |
| _set at project start_ | Phases by page, not by week |
| _set at project start_ | Public pages read from views for people data |
| 2026-10-18 | **Design = the intro animation** (`VAC-TECH Jr.html`): navy `#06122A`, gold `#FFC349`, cyan `#1FD6F7`, Poppins + JetBrains Mono, 4px cards / 6px buttons, hairline borders instead of shadows. The repo-root `DESIGN.md` is an opencode.ai analysis and is **not** our design — ignore it. `docs/DESIGN.md` was rewritten to match. |
| 2026-10-18 | Dark is the club's native theme; light is a derived daytime theme. Default follows the system setting. |
| 2026-10-18 | Admin sidebar shows every section route from the start; role filtering of that nav arrives in Phase 7 with the pages. |
| 2026-10-18 | **`VAC-TECH Jr.html` (repo root) is the new source of truth for the look**, including the intro animation. It is a single landing page; the docs still decide how the site works. The repo-root `DESIGN.md` is still opencode.ai noise. |
| 2026-10-18 | Nav labels follow the HTML: About (`/`), Notices, Events, Projects, Team (`/bod`). Gallery, Contributors, Members, Join and Contact live in the footer and on Home so every public page stays reachable. |
| 2026-10-18 | Home's Projects / Top contributors / BOD previews are **deferred to Phase 3** (their tables arrive then). They are the first Phase 3 tasks. |
| 2026-10-18 | The header and footer **stay navy in both themes** (`.chrome-dark`), because the club logo is drawn for the navy background. The intro overlay is always navy too. |
| 2026-10-18 | No fake data anywhere: no fixed countdown, no demo note. Until Phase 5 the join card says "Registration opens soon" and `/join` shows a closed state. |
| 2026-10-18 | The header logo is flattened to two PNGs (`src/assets/logo-*.png`) instead of shipping the intro's 376 kB of pieces on every page. The pieces load only when the intro plays. |
| 2026-10-18 | **One site for everyone.** Visitors and members see the same public pages and the same UI; member pages are extra pages on that site under the public header and footer. Members never see `/admin`; staff get an "Admin panel" link in their profile menu. |
| 2026-10-18 | After login a member lands on `/` (public home); staff still land on `/admin`. The session lasts until logout. |
| 2026-10-18 | Header when logged in: profile button (photo or initials) replaces "Member login", and "Join the club" is hidden. Same on the Home hero and the Join card. |
| 2026-10-18 | Profile (`/profile`, MEM-07): password changes immediately. GitHub + photo change immediately. Email, phone, name, class and section go through `profile_change_requests` (new table, ADM-16) and are applied by an Admin/Super Admin. Members can never write those five columns directly — enforced by trigger + RLS. Email changes are applied by an Edge Function with the service role. |
| 2026-10-18 | `email` and `phone` are private: never on a public page, view or seed file. |
| 2026-10-18 | Home is a landing page: centred `HeroVisual` (swappable placeholder SVG), "View about" (smooth scroll to `#about`) and "Join the club" (hidden when logged in), then What the club does, Notices, Events, an Explore links row and the Join card. No circuit canvas. |
| 2026-10-18 | Migration numbering: `0003_profiles_protection.sql` (this change), then `0004_showcase_tables` (Phase 3), `0005_registrations` (Phase 5), `0006_projects_flow` + `0007_profile_changes` (Phase 6), `0008_suggestions_email` (Phase 7). |
| 2026-10-18 | `settings` is **publicly readable** but writable by **Admin and Super Admin only**. Never store a private value there (no keys, no personal email or phone) — it is visible to every visitor. |
| 2026-10-18 | A member may self-serve `github_url`, `avatar_url` and their password flag; `full_name`, `class` and `section` need an Admin. Enforced by the trigger, replaced in `0003_profiles_protection.sql`. |
| 2026-10-18 | Read policies keep drafts in: notices are public only once `published_at <= now()`, events only when `status` is `published` or `cancelled`. Staff read everything. |

## 6. Known issues and TODOs

| # | Issue / TODO | File | Added | Status |
|---|---|---|---|---|
| 1 | Migrations **`0002` and `0003` are not applied** (confirmed: `/rest/v1/notices|events|settings` return 404, while `profiles` returns 200, so `0001` is in). Until `0002` + `seed.sql` + `0003` run, Home and `/notices`/`/events` show their error states, and a member can still edit their own name. | `supabase/migrations/000{2,3}*.sql`, `supabase/seed.sql` | 2026-10-18 | open |
| 2 | Main bundle is **562 kB (161 kB gzip)** after route-level `React.lazy()` landed in 2.4 (it was 753 kB). Vite still warns because all vendor code — React, react-router, supabase-js, sonner, date-fns — is in that one chunk. Remaining fix: split vendors with `manualChunks` (Rolldown code splitting) in Phase 8. Note `introLogo` is deliberately its own lazy chunk (367 kB) and is only fetched when the intro plays. | `vite.config.js`, `src/routes/index.jsx` | 2026-10-18 | open |
| 3 | The intro animation is ported (step 2.1). The header and footer must therefore keep `.chrome-dark`: the logo wordmark is white and disappears on a light background. | `src/index.css`, `src/components/layout/Footer.jsx` | 2026-10-18 | open |
| 4 | The intro's `prefers-reduced-motion` path and the 360px layout were checked by logic / iframe measurement, **not** by eye: this environment has no OS emulation and the browser has no visible window, so no screenshots. Confirm visually once on your machine. | `src/components/shared/IntroAnimation.jsx` | 2026-10-18 | open |
| 5 | The `.env` file is not committed (correct). Without it the app stops at load with a clear console error. Create it from `.env.example` before running. | `.env.example` | 2026-10-18 | noted |
| 6 | Tailwind v4 is CSS-first: there is no `tailwind.config.js`. All tokens live in `src/index.css` via `@theme inline`. | `src/index.css` | 2026-10-18 | noted |
| 7 | lucide-react v1 has no brand icons, so GitHub links need the inline SVG from `VAC-TECH Jr.html` (no lucide `Github` icon exists). | `docs/DESIGN.md` section 7 | 2026-10-18 | noted |
| 8 | `src/routes/MemberLayout.jsx` was unused since member pages moved into the public layout. Deleted on 2026-10-18 after confirming nothing imported it. | `src/routes/MemberLayout.jsx` | 2026-10-18 | done |
| 9 | The `notices`/`events` **success** state is unverified (no tables yet), and `HeroVisual` still uses the placeholder SVG. | `src/features/*/components/`, `src/assets/hero/` | 2026-10-18 | open |

Every `TODO` comment in code must appear here.

## 7. Session log (newest first; add one entry per session)

Format:

```
### YYYY-MM-DD: short title
- Phase / task:
- Done: (files created or changed)
- Not finished:
- Problems / decisions:
- Next step:
```

### 2026-10-18: Review follow-up — auth dead end, RLS hardening, login redirect
- Phase / task: fixes from the code review, done before `0002` is applied
- Done: `AuthContext` — `.catch` on `getSession` so `loading` always ends, and `refreshProfile` can no longer throw (a failed refresh no longer looks like a failed password save); `ProtectedRoute` — a signed-in user with no readable profile now gets an "We could not load your account" screen with a **Sign out** button instead of a spinner, and it passes `pathname + search` as the redirect `from`; `LoginPage` — returns to that `from` after login, accepting only paths that start with `/` and not `//`; `features/notices/api.js` + `features/events/api.js` — default `.limit(50)`, and the event detail no longer filters by status (RLS is the gate); `EventDetail` shows a **Cancelled** badge; `0002_content_tables.sql` rewritten — notices public only once `published_at <= now()`, events public when `status` is `published` or `cancelled`, staff read all, settings carries the never-store-private-values warning; new `0003_profiles_protection.sql` — only admin/super_admin may change `full_name`, `class` or `section`, members keep `github_url`, `avatar_url` and their password flag, service-role/SQL-editor calls still pass; deleted `src/routes/MemberLayout.jsx` (nothing imported it); renumbered planned migrations to `0004`-`0008` in PHASES + MEMORY; PRD SUP-02, ARCHITECTURE rules 12-13 and the data-layer note updated.
- Not finished: `0002`, `seed.sql` and `0003` are still not applied, so the notices/events success states remain unverified.
- Problems / decisions: settings write access stays admin + super_admin (PRD SUP-02) rather than including manager — recorded in the migration comment, PRD, ARCHITECTURE and section 5. Cancelled events are readable by design, so the event **detail** no longer filters by status while the **lists** still show published only; the Cancelled badge is what tells them apart.
- Next step: owner applies `0002`, `seed.sql`, `0003` and runs the read/write tests. Then step 2.5.

### 2026-10-18: Phase 2 step 2.3 — Home landing + content data layer
- Phase / task: Phase 2, step 2.3 (Home)
- Done: `supabase/migrations/0002_content_tables.sql` (notices, events, settings, `set_updated_at`, RLS); `features/notices` and `features/events` (`api.js`, `hooks.js`, `components/{NoticeRow,NoticeList,EventRow,EventList}.jsx` with skeleton, error and empty states); `lib/queryClient.js` + provider in `App.jsx`; `formatDate` in `lib/utils.js`; `src/assets/hero/robot-placeholder.svg` + `HeroVisual.jsx`; new `Home.jsx`; smooth scroll + `scroll-mt` in `index.css`.
- Browser-verified: hero SVG loads at 520x390 with correct alt text; "View about" smooth-scrolls (0 -> 605 -> 802, i.e. `#about` minus the 96px header) and `scroll-behavior` is `smooth`; headings and Explore links render; a guest sees "View about" + "Join the club" + "Apply for membership"; a logged-in member sees only "View about" and no Join card; 360px has no horizontal overflow; the intro still lands correctly on the new hero; console clean apart from the expected 404s.
- Problems / decisions: the live `.env` now points at a real Supabase project, so the notices/events 404s mean the tables are missing, not a placeholder host. A duplicate-React error in the throwaway browser harness came from using a stale Vite dep hash; re-importing with the current `?v=` fixed it.
- Next step: apply migrations `0001` + `0002`, then step 2.4.

### 2026-10-18: Phase 2 step 2.2 — session-aware header, footer, /profile
- Phase / task: Phase 2, step 2.2 (shared UI + profile)
- Done: `ProfileMenu.jsx` (photo or initials, menu with Admin panel for staff, Esc/outside-click close, log out); `Navbar.jsx` session-aware (Member login + Join when logged out, profile button when logged in); `Footer.jsx` navy in both themes with all 11 public links; `Button.jsx` sizes 46/40 and 15px labels; `SectionHeading.jsx`; `PasswordForm.jsx` extracted and reused; `src/pages/member/Profile.jsx` at `/profile`; `AppGate` in `routes/index.jsx` forces the first-login password change on every route; member pages moved inside `PublicLayout`; `homeForRole` sends members to `/`.
- Not finished: step 2.3 (Home) and 2.4 (remaining public pages).
- Problems / decisions: `MemberLayout` is now unused but was kept (contract: do not delete files). Verified with a live-module harness in the browser: member menu = 5 items with no Admin panel, staff menu = 6 with it, initials "TM"/"AR", avatar image renders, Esc closes, log out fires. Logged out: nav labels correct, Member login + Join present, `/profile` redirects to `/login`.
- Next step: step 2.3.

### 2026-10-18: Phase 2 step 2.1 — intro animation port
- Phase / task: Phase 2, step 2.1 (intro animation)
- Done: `src/components/shared/introLogo.json` (27 pieces extracted from `VAC-TECH Jr.html`, lazy chunk); `IntroAnimation.jsx` + `IntroAnimation.css` (same sequence/timings/easings, Web Animations API, session-once, Skip + Esc + click, 2s chunk deadline, 8s backstop, inert on the covered page, full cleanup); `src/assets/logo-mark.png` + `logo-word.png` (logo flattened at 2.25×); `index.html` pre-paint gate + `<noscript>` fallback; `src/index.css` (`.chrome-dark`, `--logo-w`, `.hslot/.hart/.htxt`, the `rv` reveal contract); `Navbar.jsx` (real logo slots as the fly targets, nav labels About/Notices/Events/Projects/Team); `App.jsx`; `Home.jsx` placeholder given `rv` classes.
- Not finished: steps 2.2 (Footer/Button/shared pieces), 2.3 (Home), 2.4 (migration 0002 + pages).
- Problems / decisions: flattening the pieces for the header needed a throwaway local HTTP endpoint (no image library, and hand-copying base64 is unsafe). WebP was smaller but showed artefacts on the wordmark, so PNG won. `react-hooks/set-state-in-effect` rejected a synchronous reduced-motion `stop()`; the check moved into the async chunk callback. `.chrome-dark` needed an explicit `color: var(--text)` or header text inherited navy-on-navy in the light theme.
- Next step: step 2.2.

### 2026-10-18: Phase 1 — auth, roles and app shell
- Phase / task: Phase 1 Auth, Roles and App Shell
- Done: `supabase/migrations/0001_profiles_roles.sql` (profiles table, `user_role` enum, `current_role()` security-definer helper, RLS policies, `profiles_protect_columns` trigger guarding `role` and `is_active`); `src/features/auth/` (api, schema, LoginPage, ChangePasswordPage); `src/context/AuthContext.jsx` + `useAuth.js`; `src/routes/` (Public/Member/Admin layouts, ProtectedRoute, route table); `src/components/ui/` (Button, Input, Card, Badge, Spinner, EmptyState, ErrorState, Modal); `src/components/layout/` (Navbar, Footer, Sidebar, PageHeader); `ThemeToggle`, `ErrorBoundary`, `NotFound`; `src/lib/constants.js`, `src/lib/utils.js`; placeholder Home/member/admin pages; `docs/DESIGN.md` rewritten to the intro palette.
- Not finished: applying migration `0001`, disabling email sign-ups, creating the first Super Admin (owner steps), and the end-to-end login test.
- Problems / decisions: `react-refresh/only-export-components` forced the context object + hook into `useAuth.js` (a component file may only export components). `react-hooks` v7 flat config needed `configs.flat[...]`. React Router only silences its `v7_startTransition` warning when the flag is on `RouterProvider`, not just on `createBrowserRouter`. A missing-env guard in `main.jsx` was tried and reverted: the lazy `App` chunk delayed first paint to a blank screen, which is worse than the dev-only console error.
- Next step: owner does the Supabase setup in section 9, then Phase 2 (public pages A + the intro animation port).

### 2026-10-18: Phase 0 — setup finished
- Phase / task: Phase 0 Project Setup
- Done: created the folder skeleton (`src/components/{ui,layout,shared}`, `src/features`, `src/pages/{public,member,admin}`, `src/routes`, `src/context`, `src/hooks`, `supabase/{migrations,functions}`) each with a `.gitkeep`; installed the approved dev toolchain into `package.json` (vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, eslint, @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh, prettier); fixed `eslint.config.js` to `reactHooks.configs.flat['recommended-latest']`. Verified `npm run lint` clean, `npm run build` ok, dev server serves `/` (200) with `main.jsx`, `App.jsx`, `index.css`, `supabaseClient.js` all transforming.
- Not finished: club accounts, `.env` values and the first Vercel deploy — owner actions.
- Problems / decisions: the repo already had the app scaffold, tokens, fonts and config files, but `package.json` had **no devDependencies** (dev toolchain never installed) and `MEMORY.md` wrongly said "not started".
- Next step: owner creates accounts + `.env`, first deploy; then Phase 1.

### Project start: documentation
- Phase / task: Planning
- Done: `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `PHASES.md`, `MEMORY.md` created
- Not finished: nothing is built yet
- Problems / decisions: see section 5; open items are in `PRD.md` section 10
- Next step: start Phase 0

## 8. Added libraries and why

Only libraries from `ARCHITECTURE.md` section 1 are pre-approved. Record any addition here.

| Library | Version | Why | Approved by |
|---|---|---|---|
| vite | ^8.3.4 | build tool (approved stack) | Phase 0 |
| @vitejs/plugin-react | ^6.1.2 | React support in Vite | Phase 0 |
| tailwindcss | ^4.3.3 | styling (approved stack) | Phase 0 |
| @tailwindcss/vite | ^4.3.3 | Tailwind v4 Vite plugin | Phase 0 |
| eslint | ^10.13.0 | linting | Phase 0 |
| @eslint/js | ^10.0.1 | ESLint recommended config | Phase 0 |
| globals | ^17.13.0 | browser globals for ESLint | Phase 0 |
| eslint-plugin-react-hooks | ^7.1.1 | hooks lint rules | Phase 0 |
| eslint-plugin-react-refresh | ^0.5.7 | fast-refresh lint rules | Phase 0 |
| prettier | ^3.9.10 | formatting | Phase 0 |

All are required by the approved stack (Vite, Tailwind, ESLint, Prettier). No third-party library was
added in Phase 1 — it is built from what was already installed.

## 9. Environment checklist

- [x] GitHub repo created (official club account)
- [x] Supabase project created — it answers at the project URL
- [ ] Email sign-ups disabled in Supabase Auth settings (**not verified by us — check it**)
- [ ] Migrations `0001` and `0002` applied (**this is what blocks Home's notices/events right now**)
- [ ] Vercel project connected to GitHub
- [x] Env vars set locally (`.env` holds real values)
- [ ] Edge Function secrets set (service role key, email API key)
- [ ] First Super Admin account created
- [ ] Email provider chosen and sender verified

### Do this before the Phase 1 login test

1. Create the Supabase project (free plan). In **Authentication → Sign In / Providers**, turn
   **email sign-ups off**.
2. Copy the Project URL and anon key into a local `.env`
   (`copy .env.example .env`), and into the Vercel project env vars.
3. In the Supabase **SQL editor**, run `supabase/migrations/0001_profiles_roles.sql`.
4. Create the first Super Admin:
   - **Authentication → Users → Add user**: email + password, tick "Auto Confirm User". Copy the new user's UUID.
   - In the SQL editor:
     ```sql
     insert into public.profiles (id, full_name, role, must_change_password)
     values ('<paste-the-uuid>', 'Club Super Admin', 'super_admin', true);
     ```
5. `npm run dev`, log in with that email + password. You should land on `/change-password`, set a new
   password, then arrive at `/admin`.
6. To test the member side, create a second user with `role = 'member'` and check you land on `/member`.
   Set `is_active = false` on one and confirm login is refused.

## 10. Instructions for the AI assistant (read every session)

1. Read this file fully, then the current phase in `PHASES.md`.
2. Tell the owner in 2 to 3 lines where the project stands and what you plan to do next.
3. Work only on tasks in the current phase. Do not skip ahead.
4. Follow `ARCHITECTURE.md` section 15 (AI boundaries) and `DESIGN.md` tokens.
5. When you finish a task: tick it in `PHASES.md`, update the tracker tables above, update sections 1 and 2, and add a session log entry.
6. If a session ends in the middle of something, write exactly where you stopped in **Resume here**, naming the file and what is left.
7. If something is unclear or conflicts with the docs, ask instead of guessing.
