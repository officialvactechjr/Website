# MEMORY.md: Project Progress and Resume Point

**This file is the project's living memory.** Anyone (human or AI) returning after a break reads this file first, then `PHASES.md`, then `ARCHITECTURE.md`.

> **Update rule:** at the end of EVERY working session, update sections 1, 2, 3 and 7. Keep entries short and factual. Never delete history; add to it.

---

## 1. Current status (update every session)

| Field | Value |
|---|---|
| Last updated | 2026-10-19 |
| Current phase | Phase 4: Admin Panel Core — code written, owner tests not run |
| Current task | Phase 4 review fixes applied (all seven findings). Waiting on the console tests |
| File(s) being worked on | `src/components/ui/{Modal,DataTable}.jsx`, `src/features/storage/api.js`, `src/features/*/hooks.js` |
| Overall progress | 4 of 9 phases complete (0-3). Phase 4 code done, unverified |
| Blocked by | nothing technical — Phase 4 needs the owner's console tests before its docs are closed |

## 2. Resume here (the single most important section)

> Write 2 to 5 lines so a person or AI can continue immediately.

- **Last thing done:** the Phase 4 admin console (dashboard + notices/events/BOD/gallery CRUD, `DataTable`, `ImageUpload`, `ConfirmDialog`, storage helpers), then the seven review fixes: `Modal` now unmounts its children so an edit form opens with the row's real values, the image resize runs before the 2 MB check, every content mutation refreshes the dashboard, `DataTable`'s dead memos are gone, the dead gallery schema is deleted, the "arrives in Phase 6" copy is out of the UI, and the admin gallery list reaches 500 rows.
- **Next thing to do:** the owner runs the **Phase 4 console tests** (storage permissions a-d, the `/admin` gates e, notice CRUD from the UI f). Once those pass, close Phase 4's docs, then start **Phase 5** (registrations, migration `0005`).
- **Watch out for:** the original `VAC-TECH Jr.html` and `VAC-Tech-Jr-Website-Plan.md` are **gone from the repo** (deleted, not by us), so `src/components/shared/introLogo.json` and the two logo PNGs are the only copy of the logo in the project. Supabase's **Site URL** still needs pointing at the Cloudflare address.

## 3. Phase tracker

Status values: `not started`, `in progress`, `done`, `blocked`.

| Phase | Name | Status | Started | Finished | Notes |
|---|---|---|---|---|---|
| 0 | Project Setup | done | 2026-10-18 | 2026-10-18 | Scaffold, toolchain, folder skeleton, tokens |
| 1 | Auth, Roles and App Shell | done | 2026-10-18 | 2026-10-18 | Login, roles, layouts, intro animation; `0001` applied |
| 2 | Public Pages A (Home, Notices, Events, Contact) | done | 2026-10-18 | 2026-10-19 | Steps 2.1-2.5. Safe point to launch the public site |
| 3 | Public Pages B (BOD, Gallery, Projects, Contributors, Members) | done | 2026-10-19 | 2026-10-19 | Migration `0004` + seed applied; views and public storage buckets live |
| 4 | Admin Panel Core | in progress | 2026-10-19 | | Code written and review-fixed; owner console tests pending |
| 5 | Registrations | not started | | | |
| 6 | Members and Projects | not started | | | |
| 7 | Points, Suggestions, Emails, Super Admin | not started | | | |
| 8 | Testing, Launch, Handover | not started | | | |

## 4. Page and file tracker

Update the status as each page is built. Statuses: `todo`, `wip`, `done`, `needs-fix`.

### Public pages
| Route | File | Req ID | Status |
|---|---|---|---|
| `/` | `src/pages/public/Home.jsx` | PUB-01 | done |
| `/notices` | `src/pages/public/Notices.jsx` | PUB-02 | done |
| `/notices/:id` | `src/pages/public/NoticeDetail.jsx` | PUB-02 | done |
| `/events` | `src/pages/public/Events.jsx` | PUB-03 | done |
| `/events/:id` | `src/pages/public/EventDetail.jsx` | PUB-03, PUB-10 | wip |
| `/bod` | `src/pages/public/Bod.jsx` | PUB-04 | done |
| `/gallery` | `src/pages/public/Gallery.jsx` | PUB-05 | done |
| `/projects` | `src/pages/public/Projects.jsx` | PUB-06 | done |
| `/projects/:id` | `src/pages/public/ProjectDetail.jsx` | PUB-06 | done |
| `/contributors` | `src/pages/public/Contributors.jsx` | PUB-07 | done |
| `/members` | `src/pages/public/Members.jsx` | PUB-08 | done |
| `/join` | `src/pages/public/Join.jsx` | PUB-09 | wip |
| `/contact` | `src/pages/public/Contact.jsx` | PUB-11 | done |

> `wip` means the page exists but waits on a later phase: the event registration form
> (PUB-10, Phase 5) and the membership form (PUB-09, Phase 5).

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
| `/admin` | `src/pages/admin/Dashboard.jsx` | ADM-15 | wip |
| `/admin/notices` | `src/pages/admin/NoticesAdmin.jsx` | ADM-01 | wip |
| `/admin/events` | `src/pages/admin/EventsAdmin.jsx` | ADM-02 | wip |
| `/admin/bod` | `src/pages/admin/BodAdmin.jsx` | ADM-03 | wip |
| `/admin/gallery` | `src/pages/admin/GalleryAdmin.jsx` | ADM-04 | wip |
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
| `0002_content_tables.sql` | notices, events, settings (public read gated by RLS) | yes | yes |
| `0003_profiles_protection.sql` | name/class/section need an admin; `protect_profile_columns` replaced | yes | yes |
| `0004_showcase_tables.sql` | BOD, gallery, projects, points, views, buckets | no | no |
| `0005_registrations.sql` | windows, applications, forms, event registrations | no | no |
| `0006_projects_flow.sql` | project status flow policies | no | no |
| `0007_profile_changes.sql` | `profile_change_requests`, `profiles.phone` | no | no |
| `0008_suggestions_email.sql` | suggestions, email_log | no | no |
| `seed.sql` (not a migration) | fake notices, events and settings for development | yes | yes |

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
| 2026-10-18 | **Hosting is Cloudflare Pages**, not Vercel: preset React/Vite, build command `npm run build`, output directory `dist`. Env vars in Cloudflare: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22`. `vercel.json` is unused. |
| 2026-10-18 | Code is on GitHub at https://github.com/officialvactechjr/Website (branch `main`). Pushing to `main` redeploys automatically. |
| 2026-10-18 | The hero uses a **robot placeholder** (`src/assets/hero/robot-placeholder.svg`, rendered by `HeroVisual.jsx`) to be swapped for the real artwork later. |
| 2026-10-19 | Light theme is kept, but its **status colours are darkened** (`success #166534`, `warning #92400e`, `danger #b91c1c`, `info #0369a1`) so they pass WCAG AA as text. The dark theme values are unchanged. |

## 6. Known issues and TODOs

| # | Issue / TODO | File | Added | Status |
|---|---|---|---|---|
| 1 | **Done.** `0001`, `0002`, `0003` and `seed.sql` were applied by the owner; verified by querying the live project. | `supabase/migrations/`, `supabase/seed.sql` | 2026-10-18 | done |
| 2 | Main bundle is **562 kB (161 kB gzip)** after route-level `React.lazy()` landed in 2.4 (it was 753 kB). Vite still warns because all vendor code — React, react-router, supabase-js, sonner, date-fns — is in that one chunk. **Bundle size review in Phase 8**: split vendors with `manualChunks` (Rolldown code splitting). `introLogo` is deliberately its own lazy chunk (367 kB), fetched only when the intro plays. | `vite.config.js`, `src/routes/index.jsx` | 2026-10-18 | open |
| 3 | The intro animation is ported (step 2.1). The header and footer must therefore keep `.chrome-dark`: the logo wordmark is white and disappears on a light background. | `src/index.css`, `src/components/layout/Footer.jsx` | 2026-10-18 | open |
| 4 | **Done.** Light-theme contrast check run on 2026-10-19 with the WCAG formula. Four status colours failed AA as text and were darkened in `src/index.css`: `success` `#16a34a`→`#166534`, `warning` `#d97706`→`#92400e`, `danger` `#dc2626`→`#b91c1c`, `info` `#0284c7`→`#0369a1`. All text pairs now pass 4.5:1 in both themes; see `DESIGN.md` section 10. **Checked and closed.** | `src/index.css`, `docs/DESIGN.md` | 2026-10-18 | done |
| 5 | **Robot artwork to replace.** The hero shows the placeholder SVG; the real robot has not been drawn yet. Swap the file only — the component and layout stay as they are. | `src/assets/hero/robot-placeholder.svg`, `src/components/shared/HeroVisual.jsx` | 2026-10-18 | open |
| 6 | **Supabase Site URL must be set to the Cloudflare address** (Authentication → URL Configuration), or auth emails and redirects will point at the wrong host. Owner action. | Supabase dashboard | 2026-10-18 | open |
| 7 | **Reference files.** The repo-root `DESIGN.md` (an opencode.ai analysis) is reference only — never import or ship it. `VAC-TECH Jr.html` (the intro animation source) and `VAC-Tech-Jr-Website-Plan.md` were **deleted on 2026-10-19** and are no longer in the repo, so `src/components/shared/introLogo.json` plus the two logo PNGs are the only copy of the logo in the project. The deletion is still uncommitted in git. | repo root | 2026-10-18 | noted |
| 8 | The intro's `prefers-reduced-motion` path and the 360px layout were checked by logic / iframe measurement, **not** by eye. Confirm visually once. | `src/components/shared/IntroAnimation.jsx` | 2026-10-18 | open |
| 9 | The `notices`/`events` **success** state is still unverified with real rows — the tables now exist, so re-check `/notices`, `/events` and Home once. | `src/features/*/components/` | 2026-10-18 | open |
| 10 | `.env` is not committed (correct). Without it the app stops at load. Create it from `.env.example` before running locally. | `.env.example` | 2026-10-18 | noted |
| 11 | Tailwind v4 is CSS-first: there is no `tailwind.config.js`. All tokens live in `src/index.css` via `@theme inline`. | `src/index.css` | 2026-10-18 | noted |
| 12 | lucide-react v1 has no brand icons, so GitHub links need the inline SVG from `VAC-TECH Jr.html` (no lucide `Github` icon exists). | `docs/DESIGN.md` section 7 | 2026-10-18 | noted |
| 13 | **Phase 1 member security tests: done.** Confirmed against the live project — a member cannot change `role`, `name`, `class` or `section` on their own row, a member cannot insert or edit a notice, and an admin can. | `supabase/migrations/0001`, `0003` | 2026-10-18 | done |
| 14 | **Phase 4 idea.** When real toasts arrive, error toasts should stay until dismissed rather than auto-dismiss after 4s — call `toast.error(msg, { duration: Infinity })`. `DESIGN.md` no longer promises this, and nothing calls `toast()` yet. | `src/App.jsx`, Phase 4 pages | 2026-10-19 | idea |
| 15 | **Orphaned storage files.** Deleting a row deletes its file, but the storage step is best effort (a failure only logs in dev). Replacing an image orphans the old file, and if an insert fails after its uploads succeed the new files have no row. Nothing sweeps these up yet. | `src/features/storage/api.js` | 2026-10-19 | open |
| 16 | **PNG over 2 MB.** `shortcut:` a lossless PNG that is over 2 MB after resizing is still rejected, because re-encoding a PNG barely shrinks it. Photos are unaffected. Convert large PNGs to JPEG if it ever bites. | `src/features/storage/api.js` | 2026-10-19 | noted |

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

### 2026-10-19: Phase 4 review fixes (seven findings)
- Phase / task: Phase 4 (admin console), fixes after the code review
- Done: **`Modal.jsx`** renders `{open && children}`, so a form inside it now remounts on every open instead of keeping the previous row's React Hook Form state — this fixes Edit opening blank and writing one row's text into another, and makes `PhotoUploader` start empty. **`storage/api.js`** checks the file type first, then shrinks, then rejects only if the *result* is over 2 MB (with a 15 MB "too large to open" guard before decoding, which stops a huge image exhausting memory): a normal 3 MB phone photo now passes the pre-check and is resized down. `['dashboard']` is invalidated in all six content mutations (`notices`, `events`, `bod`, `gallery`). `DataTable.jsx` lost its two `useMemo` wrappers (they never cached, because `columns` is a new array each render). Deleted the dead `src/features/gallery/schema.js`; no doc referenced it. Replaced the "arrives in Phase 6" copy in `admin/Dashboard.jsx` and `member/Profile.jsx` with plain wording. `GalleryAdmin` now requests `{ limit: 500 }`.
- Not finished: Phase 4's console tests (storage permissions, `/admin` gates, notice CRUD from the UI) have not been run, so Phase 4 is not closed.
- Problems / decisions: verified the Modal fix in a browser harness — Edit shows "Notice AAAA", typing into it then opening a different row shows "Notice BBBB" with no carry-over, and `PhotoUploader`'s title is empty on reopen. Verified `imageFileError` returns null for a 3 MB JPEG and friendly messages for a text file and a 20 MB image.
- Next step: owner runs the Phase 4 console tests, then Phase 4 docs are closed and Phase 5 starts.

### 2026-10-19: Review fixes — input focus ring, doc corrections
- Phase / task: follow-up from the second code review (step 2.5 close-out)
- Done: `src/components/ui/Input.jsx` — removed `focus:outline-none` so the global `:focus-visible` ring shows again on every text field (it was being overridden by a higher CSS layer and specificity); the gold focus border stays. `docs/DESIGN.md` — the touch-target line now carries the measured numbers (nav links 33px, "Member login" 36px, small button 40px, primary 46px, intro Skip 44px) and notes that WCAG 2.2 AA asks for 24px while 44px is our own goal for primary buttons and the Skip; the toast section no longer claims errors persist; section 11's copied token block was replaced with a pointer to `src/index.css` as the single source. `docs/PHASES.md` — an explicit **Close-out (2.5)** block is ticked, with the contrast check marked DONE. `docs/MEMORY.md` — section 6 item 4 closed, a new item 14 records the Phase 4 toast idea.
- Not finished: nothing from the review. Phase 3 has not been started.
- Problems / decisions: the two reference files (`VAC-TECH Jr.html`, `VAC-Tech-Jr-Website-Plan.md`) are the **owner's to handle** — not restored, not committed, not touched. Buttons were deliberately **not** resized; the doc now states the real numbers instead.
- Next step: **Phase 3** — migration `0004_showcase_tables.sql` and the public pages B.

### 2026-10-19: Step 2.5 — Phase 2 close-out (DESIGN.md pass + contrast check)
- Phase / task: step 2.5, end of Phase 2
- Done: `docs/DESIGN.md` given its final pass — status-colour table updated, the reference-file note corrected (the two source files are gone), the toast position matched to the code (top right), the intro section no longer points at a deleted file, and section 10 turned from an unticked wishlist into a **checked** accessibility record with the real numbers. Ran the WCAG contrast check over every token pair in both themes: light `success`/`warning`/`info` failed AA as text (3.3, 3.2, 4.1) and light `danger` failed on `surface-alt` (4.31), so `src/index.css` now uses `success #166534`, `warning #92400e`, `danger #b91c1c`, `info #0369a1`; every text pair passes 4.5:1 afterwards. `MEMORY.md` sections 1-3, 5-7 updated; `PHASES.md` Phase 2 closed.
- Not finished: nothing for Phase 2. Phase 3 has not been started.
- Problems / decisions: `border-strong` is deliberately left at 1.71:1 on white and recorded as a `shortcut:` line in `DESIGN.md` section 10 — it is a decorative hairline around controls whose text already carries the meaning. Found that `VAC-TECH Jr.html` and `VAC-Tech-Jr-Website-Plan.md` were deleted from the working tree by someone else and that the deletion is **uncommitted**; left untouched (not ours to commit or revert), but logged as a risk since `introLogo.json` is now the only copy of the logo pieces.
- Next step: **Phase 3** — migration `0004_showcase_tables.sql` and the public pages B.

### 2026-10-18: Migrations applied, hosting moved to Cloudflare Pages, session close-out
- Phase / task: end of session — documentation only, no code written
- Done: the owner applied `0001`, `0002`, `0003` and `seed.sql` to the live Supabase project and confirmed the Phase 1 member security tests (a member cannot change their own `role`, name, class or section, and cannot write notices; an admin can). Hosting moved to **Cloudflare Pages** (preset React/Vite, `npm run build` → `dist`, env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22`), so `vercel.json` is now unused. Code is on GitHub at https://github.com/officialvactechjr/Website (`main` auto-deploys). Docs updated: `MEMORY.md` sections 1, 2, 3, 4, 5, 6, 7, 9; `ARCHITECTURE.md` stack table + environment/deployment + handover; `PHASES.md` Phases 0, 1 and 2 ticked.
- Not finished: **step 2.5**. `PHASES.md` is ticked, but the final `DESIGN.md` pass and the light-theme contrast check are still to do.
- Problems / decisions: hosting, repo and placeholder decisions are now in section 5. Referencing the root `DESIGN.md` / `VAC-TECH Jr.html` / `VAC-Tech-Jr-Website-Plan.md` as reference-only is recorded in section 6 item 7.
- Next step: finish step 2.5 (DESIGN.md pass + contrast check), then **Phase 3** — Public Pages B, starting with the Home previews deferred from 2.3, using migration `0004`.

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

- [x] GitHub repo created (official club account) — https://github.com/officialvactechjr/Website
- [x] Supabase project created — it answers at the project URL
- [x] Email sign-ups disabled in Supabase Auth settings
- [x] Migrations `0001`, `0002`, `0003` applied
- [x] `seed.sql` applied (fake development content)
- [x] Hosting connected to GitHub — Cloudflare Pages (React/Vite preset, `npm run build` → `dist`)
- [x] Env vars set: locally in `.env`, and in Cloudflare Pages
      (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22`)
- [x] First Super Admin account created, plus a test member account
- [ ] Supabase **Site URL** set to the Cloudflare address (Authentication → URL Configuration)
- [ ] Edge Function secrets set (service role key, email API key) — Phase 6
- [ ] Email provider chosen and sender verified — Phase 7

### Do this before the Phase 1 login test

1. Create the Supabase project (free plan). In **Authentication → Sign In / Providers**, turn
   **email sign-ups off**.
2. Copy the Project URL and anon key into a local `.env`
   (`copy .env.example .env`), and into the Cloudflare Pages project env vars.
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
