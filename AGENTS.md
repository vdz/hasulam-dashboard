# hasulam-dashboard

Hebrew, RTL, mobile-first event dashboard for Hasulam. Next.js App Router + Supabase.

## Commands

| Command | What |
| --- | --- |
| `npm run db:start` | local Supabase (Docker); applies migrations + `supabase/seed.sql` |
| `npx supabase db reset` | rebuild the local DB from migrations + seed |
| `npm run db:types` | regenerate `src/lib/db/types.gen.ts` after a migration |
| `npm run dev` | app on :3000 (needs `.env.local`, see `.env.example`) |
| `npm run check` | the gate: typecheck, lint, unit, types drift, RLS, build, e2e. Same in CI |

## Layout

```
supabase/migrations/   schema, RLS, reference data (source of truth)
supabase/seed.sql      local-only dev users and a test feast
supabase/tests/        RLS tests (real Postgres)
src/app/               routes and server actions (thin)
src/components/<Name>/ Name.tsx, Name.module.css, types.ts, index.ts
src/lib/db/            the only Supabase importer: client, requireRole, queries, enums, ids
src/lib/cta/           CTA registry (Zod payloads per CTA)
src/lib/modules/       outside-world I/O (dispatchToCalendarKeeper)
src/lib/utils/         pure logic + __tests__
src/assets/locales/    all user-facing copy (he.ts)
e2e/                   Playwright smoke
.cursor/skills/verify-hasulam-dashboard/  how to drive and prove the app
```

## Rules and their enforcers

| Rule | Enforced by |
| --- | --- |
| Migrations are the schema; types are generated | `db:types:check` in `check` |
| Only `src/lib/db/*` imports `@supabase/*` | ESLint `no-restricted-imports` |
| No `any`, no `as`, no floating promises, exhaustive switches | ESLint (`strictTypeChecked`, `switch-exhaustiveness-check`, `consistent-type-assertions`) |
| Lint exceptions carry a reason and expiry | `scripts/check-lint-exceptions.mjs` (`-- reason expires YYYY-MM-DD`) |
| Strict TS with `noUncheckedIndexedAccess` | `tsconfig.json` + `typecheck` |
| Every boundary is parsed with Zod | `src/env.ts`, server actions, row schemas in `src/lib/db/*` |
| Stakeholders see/mark only their role's tasks; owner sees all | RLS + column grants, `supabase/tests/rls.test.ts` |
| One `requireRole()` gate for pages and actions | `src/lib/db/viewer.ts` |
| Outbound messages are Draft rows; approval needs an approver | `drafts` grants + check constraint |
| Dev login never in production | `src/env.ts` refuses `DEV_LOGIN_ENABLED` with `VERCEL_ENV=production` |
| No secrets in repo or client bundle; server env via `serverEnv()` only (see `docs/secrets.md`) | `.gitignore`, ESLint `no-restricted-syntax`, `import 'server-only'` in `src/env.ts`, `npm run secrets:check` |
| Never contact stakeholders without the owner's OK | no send path exists in code |
