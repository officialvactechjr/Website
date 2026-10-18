# VAC-Tech Jr. Website

Official website and member platform for **VAC-Tech Jr.**, the IT club of Vishwa Adarsha
Academy (+2), Nepal.

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

## Documentation

Read these in order before changing anything:

| File | What it holds |
|---|---|
| `docs/PRD.md` | features, roles and rules |
| `docs/ARCHITECTURE.md` | stack, folder structure, security, AI boundaries |
| `docs/DESIGN.md` | colours, fonts, spacing and component rules |
| `docs/PHASES.md` | build order, phase by phase |
| `docs/MEMORY.md` | current progress and resume point — **read this last, always** |

## Deploy

Push to `main`; Vercel builds and deploys automatically (`vercel.json` sends every route to
`index.html` so client-side routing works). Set the two environment variables in the Vercel
project settings as well.

A full handover guide is written in Phase 8.
