# Production checklist — owner actions, in order

Tick these off top to bottom. Everything here needs a human with the Supabase and
Cloudflare logins; nothing in this list can be done from the code.

**Before you start:** this repo must be committed and pushed, and
`npm run lint && npm run build` must pass locally.

---

## 1. Database

- [ ] Apply the migrations in `docs/OWNER-ACTIONS.md` section 2, in order,
      `0005` → `0013`, one file per query in the Supabase **SQL Editor**. `0013` is
      the new one (four indexes); the rest were already waiting.
- [ ] Run `supabase/audit-rls.sql` and read all six grids against the notes at the
      top of that file. Fix anything it flags **in a new migration**, never by
      editing an applied one.
- [ ] Close the seeded membership window:
      `update public.membership_windows set is_open = false;`
- [ ] Read `supabase/cleanup-test-data.sql` **before** running it, then run it to
      clear the seed rows. Confirm no test accounts or test content are left.
- [ ] Confirm the live `public_site_stats` agrees with the Home page numbers:
      `select * from public.public_site_stats;`

## 2. Supabase Auth

- [ ] Authentication → Providers: **email sign-ups disabled** (accounts are created
      by staff only).
- [ ] Authentication → URL Configuration: **Site URL** = `https://vactechjr.pages.dev`
      and the redirect list contains the same origin plus `http://localhost:5173`.
- [ ] Consider the password policy (minimum length, leaked-password protection) and
      **Turnstile CAPTCHA** on the login form.
- [ ] Edge Functions → deploy every function in `docs/OWNER-ACTIONS.md` section 5,
      with the secrets from section 4. These have **never been run**.

## 3. Cloudflare Pages

- [ ] Create the project: preset **Vite**, build command `npm run build`, output
      directory `dist`.
- [ ] Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
      (from Supabase → Settings → API) and `NODE_VERSION` = `20` (or newer).
      Never put the service-role key here.
- [ ] First deploy, then smoke test: `/`, `/home`, `/login`, a notice, an event,
      `/join`, `/terms`, `/privacy`, and a wrong URL for the 404.

## 4. Content-Security-Policy

- [ ] `public/_headers` ships the CSP as **`Content-Security-Policy-Report-Only`**,
      so nothing is blocked yet. Open every main page, then check the browser
      console: fix real violations (or widen the policy) until there are none.
- [ ] Only then rename the header to `Content-Security-Policy` and redeploy.
- [ ] The inline pre-paint script in `index.html` is allowed by a `sha256-` hash in
      `_headers`. **If that script is ever edited, the hash must be recomputed** or
      the policy will block it once enforcing. The command is in
      `docs/OWNER-ACTIONS.md` section 9.

## 5. Legal and consent (needs the school)

- [ ] `/terms` and `/privacy` both carry a visible **"Draft: must be reviewed and
      approved by the school before launch"** banner. Have the school read and
      approve both, then remove the banner.
- [ ] Have the school approve the **consent wording** on the membership form
      (`/join`) and the publishing of student photos.
- [ ] Name the **data owner** — the person responsible for student records.

## 6. Keys and backups

- [ ] Rotate any key that has ever been pasted into a chat, an issue or a commit.
- [ ] Supabase free plan: the project **pauses after inactivity** and there are
      **no point-in-time backups**. Schedule a manual export (Dashboard → Database →
      Backups, or `pg_dump`) at least once a term and store it somewhere safe.

## 7. Testing team

- [ ] Hand `docs/TESTING.md` to the testing team. Nothing in this repo has been run
      against the live database yet, so this is the gate before real data.

## 8. Weekly monitoring

- [ ] Check the Supabase dashboard (database size, Auth users, any function errors).
- [ ] Check Cloudflare Pages for failed deploys / build minutes.
- [ ] Glance at the console on a deployed page for CSP or request errors.

## 9. Git hygiene

- [ ] git rm -r --cached supabase/.temp — 9 local Supabase CLI files are tracked but are machine state, not source (docs/PRODUCTION-AUDIT.md, last section).
