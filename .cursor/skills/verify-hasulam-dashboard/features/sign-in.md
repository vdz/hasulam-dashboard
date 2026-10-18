# Sign in (dev)

## Sub-features
- Unauthenticated visit to `/tasks` redirects to `/signin`.
- Email + password form (dev only) signs in and lands on `/tasks`.
- Wrong password returns to `/signin?failed=1` with an alert.

## How to get to it (user POV)
Open the site; you land on the sign-in page.

## Driving it with Playwright
Fill `sign-in-email`, `sign-in-password`, click `sign-in-submit`. Expect `my-tasks-title` visible.

## Gotchas
Only appears with `DEV_LOGIN_ENABLED=true`. Without it the page shows `sign-in-google-soon` (Google sign-in is backlog).
A signed-in email with no `people` row is sent back to `/signin` (requireRole).
