# Secrets and configuration

Rule: no real secret is ever committed. `.env*` is git-ignored (except `.env.example`, names only).
`src/env.ts` is `server-only`; server secret names are listed in `SERVER_SECRET_NAMES` and
`npm run secrets:check` (part of `npm run check`) fails if any of them appears in a `'use client'`
file or in the `.next/static` client bundle. ESLint forbids `process.env.X` outside `src/env.ts`
for non-`NEXT_PUBLIC_` names.

| Variable | Exposure | Local dev | Vercel Development | Vercel Preview | Vercel Production | CI (GitHub Actions) |
| --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `.env.local` (`http://127.0.0.1:54321`) | Vercel env | Vercel env | Vercel env | written from local Supabase, no secret |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public (RLS protects data) | `.env.local` from `npx supabase status` | Vercel env | Vercel env | Vercel env | read from `supabase status`, no secret |
| `DEV_LOGIN_ENABLED` | server | `true` | `true` | `true` only if preview uses a seeded DB | never set (env.ts refuses `true` in production) | `true` |
| `CALENDAR_KEEPER_WEBHOOK_URL` | server-only | unset (dispatch is a no-op) | Vercel env (sensitive) | Vercel env (sensitive) | Vercel env (sensitive) | not needed |
| `CALENDAR_KEEPER_WEBHOOK_KEY` | server-only, sender key for Calendar Keeper | unset | Vercel env (sensitive) | Vercel env (sensitive) | Vercel env (sensitive) | not needed |
| `SUPABASE_DB_URL` | server-only, tests | defaults to local `postgres:postgres@127.0.0.1:54322` | - | - | - | defaults to local |
| `E2E_BASE_URL` | test config | unset | - | preview URL for smoke | - | unset |

Supabase dashboard (project `kmdlmmokqaxaicwixnjr`), never in the repo:
- Auth > Providers > Google: OAuth client ID and client secret.
- Auth > URL configuration: Site URL and redirect URLs (production domain, `https://*-vdz.vercel.app/**` for previews, `http://localhost:3000/**`).
- Database password: kept only on The Lab, not in the repo.
- `calendar_keeper` role password (see `docs/calendar-keeper-access.md`): set in the SQL editor, stored only on The Lab.
- Service role key: not used by the app; if ever needed, server-only and added to `SERVER_SECRET_NAMES`.

GitHub Actions secrets: none needed today. CI runs a throwaway local Supabase whose
well-known `supabase start` demo keys are read at runtime, not hardcoded.

Local-only, not secrets: `supabase/seed.sql` dev users (`*@hasulam.test`, `dev-password-*`) exist only
in the local/CI database (seed is never applied to the cloud project), and dev sign-in is gated by
`DEV_LOGIN_ENABLED`.

The Vercel project does not exist yet; set the variables above when it is created.
