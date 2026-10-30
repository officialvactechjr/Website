# Production audit — VAC Tech Jr website

**What this repo does:** a React + Vite single-page app for a school IT club — a public marketing
site (landing, Home, notices, events, projects, gallery, members, join form, legal) plus a
role-gated admin/member panel on Supabase (Postgres + RLS + 8 Edge Functions) — deployed as static
files to Cloudflare Pages.

**Load assumed:** a handful of concurrent readers (a club, tens of visitors a day, one or two at a
time in the admin panel), **one** web process (static hosting — no server of ours), **no** background
jobs of our own (Edge Functions run per request), Supabase free plan. So: no throughput problem, but
cold-start weight, image weight and database indexes all matter on a phone; races matter only where
two staff act at once.

Audited: whole tracked tree (248 files). Read fully: `package.json`, `vite.config.js`, `index.html`,
`main.jsx`, `routes/*`, `lib/*`, `AuthContext`, `Modal`, `DataTable`, `SiteChrome`, `HorizontalMarquee`,
`HeroVisual`, `supabaseClient`, `features/stats/*`, `public/*`, `.gitignore`, the migrations and the
Edge Functions' shared code. Skimmed: the 14 admin pages, `docs/*`.

---

## Must fix

**1. The largest contentful image is 586 KB and is discovered late — `src/components/shared/HeroVisual.jsx:1`**

- **What this is:** `hero-robot.webp` (688×960, 586 KB) is the Home hero; `HeroVisual` is rendered by
  React, so the browser cannot see the image until the JS has parsed and rendered.
- **Problem:** on a phone this is the slowest thing on the page — the LCP element — and it is fetched
  at default priority, after Supabase/query work has begun.
- **Fix:** re-encode to ~120-150 KB (WebP q78, dimensions kept, so `width`/`height` stay right) and
  add `fetchpriority="high"` + a hoisted `<link rel="preload" as="image">` from the component.
- **If we skip it:** the club's first impression is a hero that pops in late on 4G.

**2. `/login` ships a 412 KB image for a decorative astronaut — `src/features/auth/LoginPage.jsx:13`**

- **What this is:** `h.webp` (412 KB) floats behind the login panel at ≤74% of the column.
- **Problem:** 412 KB for decoration on the one page a visitor hits first when invited.
- **Fix:** re-encode to ≤100 KB at the size it is actually drawn (it is never full-bleed).
- **If we skip it:** a third of a megabyte for a login screen.

**3. Font subsets nobody needs: Devanagari + latin-ext for Latin-only text — `src/main.jsx:5-10`**

- **What this is:** `@fontsource/poppins/400.css` (etc.) pulls **every** subset — Devanagari alone is
  52 KB × 4 weights — and the site has no Devanagari text.
- **Problem:** ~300 KB of fonts in `dist`, and the browser must decide what to fetch.
- **Fix:** import the `latin-*.css` files instead (`@fontsource/poppins/latin-400.css`, …). Look is
  identical.
- **If we skip it:** the largest single byte cost after the hero image.

**4. No security headers at all — `public/_headers` does not exist**

- **What this is:** Cloudflare Pages serves our files bare: no `nosniff`, no frame protection, no
  referrer policy, no CSP, and no long-term caching for hashed `/assets/*`.
- **Problem:** any future XSS (a notice body, an answer field) is easier to exploit; hashed assets are
  re-validated on every visit instead of being cached for a year.
- **Fix:** add `public/_headers` with nosniff, `Referrer-Policy`, `X-Frame-Options: DENY`,
  `Permissions-Policy`, immutable `/assets/*`, `no-cache` for `index.html`/manifest, and a
  **report-only** CSP first (needs a `script-src` hash for the inline pre-paint script).
- **If we skip it:** we ship without the cheapest hardening available, and pay for it on every visit.

**5. A 3.2 MB dead artwork file is tracked — `src/assets/roboParticle.svg`**

- **What this is:** the source SVG that was rasterised once into `particles.webp`; `MEMORY.md` itself
  notes it was "left in place, unused".
- **Problem:** proven unused — no import, no `url()`, no `index.html` reference, only a doc mention.
  3.2 MB of git history and working tree for nothing.
- **Fix:** delete it.
- **If we skip it:** every clone and every backup carries 3.2 MB of dead weight.

**6. Private routes are open to indexing — `public/robots.txt` + `src/lib/meta.js`**

- **What this is:** `robots.txt` allows everything and no page emits a `robots` meta tag.
- **Problem:** `/admin`, `/member`, `/profile`, `/login` and `/change-password` can be crawled and
  listed; the login page in a search result is an invitation to credential stuffing.
- **Fix:** disallow those five prefixes in `robots.txt` **and** emit `<meta name="robots" content="noindex">`
  from `PageMeta` for them (robots.txt alone does not prevent indexing of a linked URL).
- **If we skip it:** the panel's front door gets indexed.

## Should fix

**7. `vercel.json` — config for a host we do not use (root)**

- **What this is:** a leftover redirect file from the Vercel era; deploy is Cloudflare Pages.
- **Problem:** proven unused (no config or code reads it) and actively misleading for the next person.
- **Fix:** delete (Cloudflare needs no `_redirects`; its SPA fallback is automatic).
- **If we skip it:** a future deploy change gets made in the wrong file.

**8. Twelve `.gitkeep` files in folders that now have files**

- **What this is:** scaffolding placeholders from the empty-repo phase.
- **Problem:** 10 of them sit in directories with real content, so they do nothing but appear in
  listings. (Two are inside `supabase/functions` and `supabase/migrations`, which are protected in this
  pass, so they stay.)
- **Fix:** delete the 10 under `src/`.
- **If we skip it:** noise only.

**9. Two moderate CVEs via `react-router-dom` 6.x**

- **What this is:** GHSA-wrjc-x8rr-h8h6 (open redirect through a backslash in `<Link>/useNavigate`) and
  GHSA-337j-9hxr-rhxg (SSR hydration), both fixed only in react-router 7.
- **Problem:** every `to=` in this app is a hardcoded or id-derived internal path, and there is no SSR,
  so neither CVE is reachable today. The fix is a **major** upgrade, which the ground rules exclude.
- **Fix:** leave it; re-check when the router is upgraded for other reasons. Audit is clean otherwise.
- **If we skip it:** two moderates stay on the report and a reviewer will ask about them.

**10. Hot query filters have no indexes — `supabase/migrations/`**

- **What this is:** every public read filters `events(status, starts_at)`, `projects(status, owner_id)`,
  `profiles(role, is_active)`, plus the registration/points/audit/notice/gallery lists.
- **Problem:** Postgres seq-scans a small table today, but a club's `points_log` and `audit_log` only
  grow, and the RLS policies add per-row work on top.
- **Fix:** one new migration `0013` with `create index if not exists` for the filters the code actually
  uses (no speculative indexes).
- **If we skip it:** the admin lists get slowly slower forever.

**11. RLS helpers are called per row — `supabase/migrations/0001…0012`**

- **What this is:** policies call `public.current_role()` and compare against the row's owner.
- **Problem:** Postgres may re-evaluate a `stable` function for every row; wrapping it as
  `(select public.current_role())` lets the planner evaluate it once per query.
- **Fix:** measure first with `explain analyze` on a seeded table; if the policy shows up, change it in a
  **new** migration. Not done blind — old migrations must not be edited.
- **If we skip it:** possibly a constant-factor cost at club scale; no correctness risk.

**12. CORS allow-list and error shapes in the Edge Functions are unverified (never deployed) — `supabase/functions/_shared/cors.ts`**

- **What this is:** the functions have never run (MEMORY #22/#30), so the allowed origins, and whether
  errors leak internals, are unproven.
- **Problem:** a permissive CORS list would let any site call the account functions with a stolen token.
- **Fix:** read and pin the list to the two known origins; make `respond.ts` return plain sentences.
  Verified by reading now; behaviour still needs the owner's deploy to be proven.
- **If we skip it:** the highest-risk code in the repo stays unverified.

**13. Marquee strips animate while offscreen or in a hidden tab — `src/components/shared/HorizontalMarquee.jsx`**

- **What this is:** a CSS transform loop that runs regardless of visibility.
- **Problem:** it is compositor-only and the browser throttles hidden tabs, so the cost is small — but
  on a long Home page two strips keep compositing while scrolled far away.
- **Fix:** a 6-line `IntersectionObserver` adding a paused class when offscreen.
- **If we skip it:** small constant paint cost on low-end phones.

**14. Tailwind scans `docs/` — `src/index.css:1`**

- **What this is:** v4 auto-detects sources from the project root, so 200 KB of Markdown tables full of
  Tailwind-looking class names generate utilities nothing uses (the CSS bundle is 82 KB).
- **Problem:** dead CSS shipped on every visit.
- **Fix:** `@import 'tailwindcss' source(none);` + `@source '../src';` + `@source '../index.html';` —
  then build and diff the CSS to prove nothing real vanished (it is easy to get this wrong, so it is
  left as a measured follow-up rather than a blind edit in this pass).
- **If we skip it:** 82 KB of CSS stays largely unused.

## Nice to have

**15. `docs/admin-layout-blueprint.html` is referenced by nothing**

- **What this is:** a stand-alone HTML blueprint from the admin design phase.
- **Problem:** unreferenced, but it is documentation, not code.
- **Fix:** keep it in `docs/` (it is design history and it is protected) — **owner decision** whether to
  move it next to the other references or delete it.
- **If we skip it:** nothing breaks.

**16. Housekeeping: `format:check`, `engines`, README host**

- **What this is:** no `format:check` script, no `engines` field, and `README.md` still mentions Vercel.
- **Problem:** CI and a new contributor have nothing to check against; the README describes the wrong host.
- **Fix:** add the script + `engines` and correct the README (done in this pass).
- **If we skip it:** small onboarding friction.

**17. Two near-identical account helpers — `supabase/functions/_shared/members.ts`**

- **What this is:** `createMemberAccount` and `createStaffAccount`, ~40 lines each.
- **Problem:** already logged as MEMORY #32 (idea). A fix to one can be forgotten in the other.
- **Fix:** merge only if it stays a trivial, obviously-safe change — otherwise leave it logged.
- **If we skip it:** a known, documented duplication.

**18. Canonical origin is hardcoded — `src/lib/meta.js:8`**

- **What this is:** `SITE = 'https://vactechjr.pages.dev'`.
- **Problem:** it is a canonical/OG base URL, which must be absolute, and it is already documented.
- **Fix:** leave it; move to an env var only when a custom domain is decided.
- **If we skip it:** one more place to edit on a domain change.

---

## Deleting now (with proof)

| File                                   | Proof                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/assets/roboParticle.svg` (3.2 MB) | No import, no `url()`, no `index.html` reference. Only mention is a `MEMORY.md` note calling it unused.                                 |
| `vercel.json`                          | No reference in `vite.config.js`, `index.html`, `src/`, scripts or Cloudflare config. Deploy target is Cloudflare Pages.                |
| `src/**/.gitkeep` × 10                 | Every one of those directories now holds real files (`git ls-files` shows content); `.gitkeep` only exists to keep an empty dir in git. |

## Keeping (with reason)

- `public/` icons + manifest — referenced by `index.html` and the manifest.
- `docs/` (all), `supabase/migrations/`, `supabase/functions/`, `supabase/*.sql` — protected and in use.
- root `DESIGN.md` — the reference file (protected, excluded from prettier).
- `src/assets/hero/hero-robot.webp`, `h.webp`, `particles.webp`, `logo-*.webp`, `intruder.webp` — all
  imported by a component.
- `src/components/shared/introLogo.json` (378 KB) — lazy, and the only copy of the logo artwork left.
- All 12 runtime dependency families — each proven imported in `src/`.
- `package-lock.json` — protected.
- `.env` — untracked (`.gitignore` covers `.env*`), only the two `VITE_` names exist.

## Needs owner decision

- `docs/admin-layout-blueprint.html` — keep as history, or move out of the built site's tree.
- Root `DESIGN.md` (opencode.ai analysis) — keep as reference or delete.
- `VAC-TECH Jr.html` / `VAC-Tech-Jr-Website-Plan.md` — already deleted and committed (MEMORY #7); nothing
  to do.
- react-router 7 upgrade (closes the two moderates) — a major bump, so not done here.

---

## Verdict

The repo is in good shape for a club project: no unused dependencies, no TODO/FIXME left in `src/`, no
secrets in the tree, no console noise in production (the two `console.error` calls are `DEV`-guarded), a
lazy route table with real vendor splits, and RLS on every table. What stood between it and a good
deploy was **weight and hardening**, not correctness: a 586 KB hero discovered late, a 412 KB login
image, ~300 KB of Devanagari fonts nobody reads, a 3.2 MB dead SVG, zero security headers, an open
robots.txt, and no indexes behind the growing admin lists. Everything in _Must fix_ is fixed in this
pass (see the before/after table at the end of this file); the _Should fix_ items that need measuring
rather than guessing are written up with their exact fix.

**Lean: -22 lines, -0 dependencies possible.** (`roboParticle.svg` is 3.2 MB of bytes and one line of
tracking, not 3.2 MB of code; no dependency could be removed — every one is imported.)

**Not checked:** the 14 admin pages and 5 member pages were skimmed, not read line by line; the Edge
Functions were read for CORS/error shape but never executed; no query was run against a live database,
so the index advice in #10 is from reading filters, not from `explain analyze`; the visual pass covered
360/768/1280 in Chromium only (no Firefox, no real device); and nothing in `supabase/seed.sql`,
`cleanup-test-data.sql` or `check-migrations.sql` was reviewed beyond its name.

## Needs owner decision (git hygiene, found in the pass)

`supabase/.temp/` holds **9 local Supabase CLI files that are tracked** (`cli-latest`,
`gotrue-version`, `linked-project.json`, `pooler-url`, `postgres-version`, `project-ref`, `rest-version`,
`storage-migration`, `storage-version`). They are machine state, not source: they change whenever the
CLI runs and they differ per machine. `.gitignore` and `.prettierignore` now cover the folder for
future runs, but the tracked copies have to be removed from the index by hand, because the pass must
not stage or commit anything:

```bash
git rm -r --cached supabase/.temp
```
