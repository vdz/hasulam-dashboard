# Sign in (Google only; dev login local-only)

## Sub-features
- Unauthenticated visit to `/tasks` redirects to `/signin`.
- `/signin` shows one Google button (`sign-in-google`). It posts a server action that calls Supabase
  `signInWithOAuth({ provider: 'google' })` (PKCE) and redirects to `<supabase>/auth/v1/authorize?provider=google&redirect_to=<origin>/auth/callback?next=...`.
- `/auth/callback?code=...` exchanges the code for a session cookie and redirects to `next` (same-origin paths only, see `safeNextPath`). Bad code → `/signin?failed=1`.
- Signed in but email not in `people` → `/not-a-member` (`not-member`), no data; "sign in with another account" signs out.
- Dev form (`sign-in-dev-form`) appears only with `DEV_LOGIN_ENABLED=true` against a local Supabase.

## Driving it with Playwright
- Google: you cannot complete real Google locally. Intercept `**/auth/v1/authorize**` with `page.route` and assert the query (`provider=google`, `redirect_to` path `/auth/callback`, `code_challenge_method=s256`). See `e2e/sign-in.spec.ts`.
- Member: fill `sign-in-email`/`sign-in-password` with `dev-kitchen@hasulam.test` / `dev-password-kitchen`.
- Non-member: `dev-outsider@hasulam.test` / `dev-password-outsider`.

## Gotchas
- Real Google needs the console steps in `docs/setup-google-and-vercel.md`; local Supabase has no Google provider.
- `env.ts` throws at request time if `DEV_LOGIN_ENABLED=true` with a `*.supabase.co` URL. That is intended.
