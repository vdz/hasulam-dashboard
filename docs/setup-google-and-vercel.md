# Setup: Google sign-in + Vercel (owner's consoles)

Steps only the owner can do in Google Cloud, Supabase and Vercel dashboards. Nothing here goes in the repo.
Supabase project ref: `kmdlmmokqaxaicwixnjr` (region eu-central-1). Sign-in is **Google only**.

Placeholders: `<PROD>` = production origin, e.g. `https://hasulam-dashboard.vercel.app` (or a custom domain).

## 1. Google Cloud: OAuth client

1. https://console.cloud.google.com → create or pick a project (e.g. "Hasulam").
2. APIs & Services → **OAuth consent screen** (Google Auth Platform → Branding/Audience):
   - User type: **External**. App name: `הסולם – לוח אירועים`. Support + developer email: `gilead.yehuda@gmail.com`.
   - Scopes: only `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` (non-sensitive, no Google verification needed).
   - Audience: **Publish app → In production**. (In "Testing" only listed test users can sign in and sessions expire after 7 days.)
3. APIs & Services → **Credentials → Create credentials → OAuth client ID → Web application**, name `hasulam-dashboard`.
   - **Authorized JavaScript origins**:
     - `<PROD>`
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs** (Google redirects to Supabase, not to the app):
     - `https://kmdlmmokqaxaicwixnjr.supabase.co/auth/v1/callback`
     - `http://127.0.0.1:54321/auth/v1/callback` (optional: only if testing real Google against the local Supabase)
4. Copy the **Client ID** and **Client secret**. Do not paste them into chat or the repo.

## 2. Supabase dashboard (project kmdlmmokqaxaicwixnjr)

1. Authentication → **Sign In / Providers → Google**: Enable, paste Client ID + Client secret, Save.
   The page shows the callback URL; it must equal `https://kmdlmmokqaxaicwixnjr.supabase.co/auth/v1/callback`.
2. Authentication → Sign In / Providers → **Email**: **disable** (no email/password or magic link in production).
3. Authentication → Sign In / Providers → **Allow new users to sign up: keep ON.** Turning it off also blocks a member's
   *first* Google sign-in. Non-members get an auth user but see only the "not a member" screen and no data (RLS).
4. Authentication → **URL Configuration**:
   - Site URL: `<PROD>`
   - Redirect URLs (add each):
     - `<PROD>/auth/callback`
     - `https://hasulam-dashboard-*-vdz.vercel.app/**` (Vercel preview deploys; adjust if the team slug differs)
     - `http://localhost:3000/auth/callback`
     - `http://127.0.0.1:3000/auth/callback`
5. Project Settings → **API Keys**: copy the Project URL (`https://kmdlmmokqaxaicwixnjr.supabase.co`) and the
   **publishable** key (`sb_publishable_...`; the legacy `anon` key also works). Never use the `service_role`/secret key in Vercel.
6. **Schema not yet applied**: the cloud database has no migrations yet (checked 2026-10-23). Before the first real sign-in,
   apply `supabase/migrations/*` (Engineering can do it via a one-off GitHub Action using the DB password, on your OK),
   then run the private `supabase/seeds/private/people.sql` once in the SQL editor. Never run `supabase/seed.sql` (dev users) there.

## 3. Vercel (team vdz, Hobby = free)

1. https://vercel.com/new → Import Git repository `vdz/hasulam-dashboard` into team **vdz**. Framework: Next.js (auto). Root: `/`.
   Build command and output: defaults. Node.js version (Settings → Build): 22.x.
2. Settings → **Environment Variables**:

| Name | Value | Production | Preview | Development |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kmdlmmokqaxaicwixnjr.supabase.co` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key from step 2.5 | ✓ | ✓ | ✓ |
| `DEV_LOGIN_ENABLED` | **do not set** (the app refuses it in production and against any `*.supabase.co`) | – | – | – |
| `CALENDAR_KEEPER_WEBHOOK_URL`, `CALENDAR_KEEPER_WEBHOOK_KEY` | later (slice 3), mark Sensitive | – | – | – |

3. Deploy. Every PR then gets a preview URL (`hasulam-dashboard-<hash>-vdz.vercel.app`) from the Vercel GitHub app.
   Previews use the same cloud database as production (one free project).
4. Put the final production origin into step 1.3 (JS origins) and step 2.4 (Site URL + redirect) if it differs from the guess.

## 4. Check it works

1. Open `<PROD>/signin` on a phone → "כניסה עם Google" → pick a Gmail account in the people table → lands on `/tasks`.
2. Same with a Gmail **not** in the people table → "עדיין לא ברשימה" screen, no data.
3. `<PROD>/signin` shows no email/password form.
