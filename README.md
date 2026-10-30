# VAC-Tech Jr. Website

Official website and member platform for **VAC-Tech Jr.**, the IT club of Vishwa Adarsha
Academy (+2), Nepal.

Live site: https://vactechjr.pages.dev · Repository: https://github.com/officialvactechjr/Website

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
npm run format    # Prettier
```

## Environment variables

Copy `.env.example` to `.env` and fill in both values from the Supabase project settings
(Supabase dashboard → Project Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Those two are the **only** variables allowed in the frontend. The service role key and the
email API key live in Supabase Edge Function secrets and must never appear in this repo.

Without a working `.env` the app stops at load — that is deliberate, so a misconfigured
deploy is obvious immediately.

## What is where

| Area                                          | Path                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Public pages                                  | `src/pages/public/`                                                    |
| Member pages (projects, suggestions, profile) | `src/pages/member/`                                                    |
| Staff panel pages                             | `src/pages/admin/`                                                     |
| Data access (one folder per domain)           | `src/features/<name>/` — `api.js`, `hooks.js`, `schema.js`, components |
| Shared UI                                     | `src/components/{ui,layout,shared}/`                                   |
| Routes and role guards                        | `src/routes/`                                                          |
| Database (apply in numbered order)            | `supabase/migrations/`                                                 |
| Server-side functions (hold the secrets)      | `supabase/functions/`                                                  |
| Fake development content                      | `supabase/seed.sql`                                                    |

Rule of the codebase: **no Supabase call inside a component.** Pages compose features;
features call `api.js`; `hooks.js` wraps those in TanStack Query.

## Deploy

Push to `main`; **Cloudflare Pages** builds and deploys automatically (React/Vite preset,
build command `npm run build`, output directory `dist`; unknown routes fall back to
`index.html` so client-side routing works). Set the environment variables in the Cloudflare
Pages project settings as well: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
`NODE_VERSION=22`.

Database changes are **not** deployed by Cloudflare: apply new files in
`supabase/migrations/` in the Supabase SQL Editor, in numbered order, and deploy Edge
Functions with the CLI. Every secret and deploy step is in `docs/OWNER-ACTIONS.md`.

## Common tasks

**Add a notice** — Staff panel → Notices → New notice. It stays invisible to visitors until
`published_at` is in the past. Pin it to keep it at the top of `/notices`.

**Add an event, board member or gallery photo** — Staff panel → Events / Board of directors /
Gallery. Images are shrunk in the browser and must be JPEG, PNG or WebP under 2 MB.

**Create a member account** — Staff panel → Members → New member (Admin or Super Admin).
The email and a **one-time temporary password** are shown once: write them down and hand them
over in person. The member is forced to choose their own password at first login. Import many
at once with the CSV template on the same page.

**Reset a password or deactivate an account** — Staff panel → Members → the row's actions.
An admin cannot reset a Super Admin; only another Super Admin can.

**Change someone's role** — Staff panel → Roles (Super Admin only). `member`, `manager` and
`admin` can be set; **`super_admin` cannot** — it is handed over in person, by hand.

**Open or close membership** — Staff panel → Membership window (Admin and Super Admin).
While open, `/join` shows the form; it closes by itself at the set time.

**A member wants their name, class, section, email or phone changed** — they request it on
`/profile`; staff approve or reject it in Staff panel → Profile changes. The member's photo
and GitHub link change instantly, without approval.

**Send an email to members** — Staff panel → Emails (Admin and Super Admin). Choose a group,
preview, send. Every dispatch is written to the history below; nothing is sent twice by accident
because the function caps one dispatch at 100 recipients.

**Give points** — Staff panel → Points (Admin and Super Admin). Every award needs a reason and
is permanent: a correction is a new row. `/contributors` reads the totals.

## Who owns what

| Account                      | Registration email | Who has access                                                         |
| ---------------------------- | ------------------ | ---------------------------------------------------------------------- |
| GitHub (`officialvactechjr`) | the club's email   | Club account owner + the teacher in charge                             |
| Supabase (project owner)     | the club's email   | Club account owner; the Super Admin is added as an organisation member |
| Cloudflare Pages             | the club's email   | Club account owner                                                     |
| Resend (or Brevo)            | the club's email   | Club account owner                                                     |

Rules that keep this handover-able:

- No personal accounts. Every account is registered to the club's email and at least two
  people know the password (the club owner and the teacher in charge).
- The **Super Admin** is institution staff, agreed in writing, and can hand the role over.
- The service role key and the email API key exist **only** in Supabase Edge Function secrets.
- Nothing in this repo should ever contain a real key, a real password or real student data.

## Documentation

Read these in order before changing anything:

| File                    | What it holds                                                                |
| ----------------------- | ---------------------------------------------------------------------------- |
| `docs/PRD.md`           | features, roles and rules                                                    |
| `docs/ARCHITECTURE.md`  | stack, folder structure, security, AI boundaries                             |
| `docs/DESIGN.md`        | colours, fonts, spacing and component rules                                  |
| `docs/PHASES.md`        | build order, phase by phase                                                  |
| `docs/TESTING.md`       | the test plan for the testing team (Phases 1-8) and the pre-launch checklist |
| `docs/HANDOVER.md`      | the plain-language guide for the next committee                              |
| `docs/OWNER-ACTIONS.md` | migrations, secrets and deploys only the owner can do                        |
| `docs/MEMORY.md`        | current progress and resume point — **read this last, always**               |
