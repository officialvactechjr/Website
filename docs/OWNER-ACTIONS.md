# OWNER-ACTIONS.md: what only you can do

Everything the assistant cannot do for you: creating accounts, setting secrets,
deploying, and the checks that need a human. **Do these in this order** — each
section assumes the one above it is done.

> Keep this list current. When an action is done, tick it here.
>
> The whole app is built. Nothing below has been done yet: `0005`-`0010` are **not applied** and
> **no Edge Function is deployed**. Because no function is deployed, every account screen shows
> "The account service is not reachable…" until section 5 is done.

---

## 1. Accounts (once, at the start)

- [ ] **GitHub** — an account owned by the club (not a personal one), holding the repo.
- [ ] **Supabase** — project created; email sign-ups **off**. Add the Super Admin
      (institution staff) as an organisation member.
- [ ] **Cloudflare Pages** — connected to the repo. Build command `npm run build`,
      output directory `dist`, preset React/Vite.
- [ ] **Cloudflare Pages env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
      `NODE_VERSION=22`.
- [ ] **Supabase → Authentication → URL Configuration:** set the **Site URL** to the
      Cloudflare address (`https://vactechjr.pages.dev`) and add it to the redirect list.

## 2. Database

Apply the migrations in the Supabase **SQL Editor**, in this order, one file per query.
`0001`-`0004` are already applied; the seven below are not.

- [ ] `0005_registrations.sql`
- [ ] `0006_projects_and_profile_changes.sql`
- [ ] `0007_points_suggestions_email.sql`
- [ ] `0008_membership_form_and_templates.sql` — the membership form's question snapshot and
      the extra-answers column, plus the `form_templates` table and its five starting templates.
- [ ] `0009_accounts_and_audit.sql` — the member class/section rule, `public_members` limited to
      members, and the append-only `audit_log` table.
- [ ] `0010_atomic_account_status.sql` — moves the "last active super admin" check into one
      database function (`set_account_active`), so two admins deactivating each other at the same
      moment cannot both succeed and lock the club out.

Each file is safe to re-run only if it has never been applied: they are written to be
applied **once**, in order. If one fails, paste the error into the issue/changelog and stop
— do not edit a migration that is already applied.

> **School must approve the consent wording before real students apply.** The consent sentence is
> an editable question on the membership form (stored with each window's question snapshot and in
> the "Standard membership" template). Get the school's sign-off on that exact wording — and on
> publishing student photos — before a real window is opened.

Then, for a development or demo project only:

- [ ] `seed.sql` — fake content. **Never run this against real club data.** It is
      re-runnable, so it is also the way to put samples back after a test run.
- [ ] Close the seed membership window before the site is public:
      `sql
update public.membership_windows set is_open = false;
`
- [ ] Verify: `select id, public from storage.buckets order by id;` → four buckets
      (`avatars`, `bod-photos`, `gallery`, `project-images`), all public.

## 3. The first Super Admin

1. Supabase → **Authentication → Users → Add user**. Enter the institution staff
   member's email and a password, tick **Auto Confirm User**. Copy the new UUID.
2. In the SQL editor:
   ```sql
   insert into public.profiles (id, full_name, role, email, must_change_password)
   values ('<paste-the-uuid>', 'Club Super Admin', 'super_admin', '<the same email>', true);
   ```
3. Hand over the email and password in person. They are asked to choose their own
   password on first login.

## 4. Edge Function secrets

Supabase → **Project Settings → Edge Functions → Secrets** (or the CLI in section 5). The
service role key must never appear in the frontend, in `.env`, in `src/`, in any `VITE_…`
variable, or in the repo — it lives only as a Supabase secret.

**Secret** (never commit, never paste into the app or a screenshot):

| Name                         | Where to find it                          | Used by              |
| ---------------------------- | ----------------------------------------- | -------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`  | Project Settings → API → `service_role`   | every account function |
| `RESEND_API_KEY`             | resend.com → API Keys (section 6)         | `send-email`         |
| `BREVO_API_KEY`              | brevo.com → SMTP & API (only if using Brevo) | `send-email`      |

**Not secret** (safe to keep in the dashboard, still set them as secrets for tidiness):

| Name             | Value                                              |
| ---------------- | -------------------------------------------------- |
| `SENDER_EMAIL`   | the verified sender, e.g. `VAC-Tech Jr <club@yourdomain.com>` |
| `EMAIL_PROVIDER` | leave unset for Resend, or set it to `brevo`       |

Supabase injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically. **Do not set those by
hand.**

## 5. Deploy the Edge Functions (Windows PowerShell)

Run these from the project root. Copy each block as-is.

**1. Install the Supabase CLI** (once). If you have Scoop:

```powershell
scoop install supabase
```

Otherwise use npm (Node 22 is already installed for the site):

```powershell
npm install --global supabase
supabase --version
```

**2. Log in** (once). This opens a browser to approve the login:

```powershell
supabase login
```

**3. Link this folder to the project.** `<your-project-ref>` is the short code in the dashboard
URL (`https://supabase.com/dashboard/project/<your-project-ref>`):

```powershell
cd "D:\VAC - Tech Jr\Website"
supabase link --project-ref <your-project-ref>
```

**4. Set the secrets** (once, and again any time a key changes). These are **secret** — they are
read from your shell and are never written to a file:

```powershell
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
supabase secrets set SENDER_EMAIL="VAC-Tech Jr <club@yourdomain.com>"
supabase secrets set RESEND_API_KEY="<resend-api-key>"
# Only if you chose Brevo instead of Resend:
# supabase secrets set EMAIL_PROVIDER="brevo"
# supabase secrets set BREVO_API_KEY="<brevo-api-key>"
supabase secrets list          # names only; values are never shown again
```

**5. Deploy every function.** Each command prints the function URL when it succeeds:

```powershell
supabase functions deploy create-member
supabase functions deploy bulk-create-members
supabase functions deploy create-staff
supabase functions deploy reset-password
supabase functions deploy set-account-status
supabase functions deploy apply-profile-change
supabase functions deploy change-role
supabase functions deploy send-email
```

- [ ] All **eight** deployed, each with **JWT verification on** (the default).
- [ ] CORS is restricted to `https://vactechjr.pages.dev` and `http://localhost:5173`
      in `supabase/functions/_shared/cors.ts` — change both entries if the address changes,
      then redeploy every function.
- [ ] **Smoke test:** open `/admin/members` → **New member** → create a test account. The
      temporary password must appear once. If it does not, the message now names the function to
      deploy (for example "…deploy the create-member function…"). Check the browser's Network tab
      shows `200`, not `404`.

## 6. Email provider (Resend by default, Brevo optional)

**Resend**

1. Create an account at resend.com with the **club's** email address, not a personal one.
2. **Domains → Add domain**, enter the club's domain, and add the DNS records it shows
   (SPF/DKIM) at the domain registrar. Verification usually takes minutes.
   _No domain yet?_ Resend's own `onboarding@resend.dev` sender works for a first test,
   but it only delivers to the account owner's address.
3. **API Keys → Create API Key**, permission _Sending access_. Copy it once — it is
   never shown again — and set it as `RESEND_API_KEY` (section 4).
4. Set `SENDER_EMAIL` to an address on the verified domain, e.g.
   `VAC-Tech Jr <club@yourdomain.com>`.
5. Send yourself one real email from `/admin/emails` (choose "Chosen members", pick
   your own test account) and confirm it arrives.

- [ ] Free tier: **Resend** gives about **3,000 emails a month, 100 a day** — a broadcast
      to 60 members is 60 of them. **Brevo** gives about **300 a day**. Either fits the club.
- [ ] The function sends at most **100 recipients per dispatch**, spaced ~0.5 s apart to stay
      inside the provider's per-second limit. A bigger club sends in batches.
- [ ] Swapping to Brevo later: set `BREVO_API_KEY`, set `EMAIL_PROVIDER=brevo`, redeploy
      `send-email`. No code change.

## 7. Before any real student data

- [ ] The testing team has run `docs/TESTING.md` from Phase 1 to Phase 8 and every row has
      a Pass or a logged decision.
- [ ] The school has approved the consent wording on the Join form and the use of student photos.
- [ ] A **data owner** is named — a person responsible for member records, who is told when a
      member asks for their data to be corrected or removed.
- [ ] The PRE-LAUNCH CHECKLIST at the end of `docs/TESTING.md` is complete: test accounts
      removed or renamed, the seed window closed, seed content replaced, Supabase Site URL set,
      dev keys rotated, storage swept.
- [ ] `docs/HANDOVER.md` read by the next committee, accounts transferred, release tagged `v1.0`.

## 8. The five-minute health check (any time)

1. Home loads with the intro, then the hero, with no console errors.
2. Log in as the Super Admin: you land on `/admin`, the sidebar shows all 17 entries.
3. `/admin/members` lists accounts; open one and reset its password (a temp password appears once).
4. `/admin/emails` shows the dispatch history (empty is fine).
5. Log out, then open `/admin` — you are sent to `/login`.
