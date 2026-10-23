---
name: verify-hasulam-dashboard
description: Launch, drive, and prove the Hasulam event dashboard (Hebrew RTL Next.js web UI on local Supabase) the way a stakeholder uses it on a phone. Use before handing off any change to the dashboard, after a migration, or when asked to show that a feature works.
---

# Verify hasulam-dashboard

Surface: mobile web UI (390x844, RTL Hebrew). Data: local Supabase in Docker with seeded dev users. Production sign-in is Google only; verification uses the dev form, which appears only when `DEV_LOGIN_ENABLED=true` against a local Supabase.

Seeded dev users (local only, `supabase/seed.sql`):

| Email | Password | Role | Sees |
| --- | --- | --- | --- |
| dev-owner@hasulam.test | dev-password-owner | owner | all 19 tasks of `dev-feast-1` |
| dev-kitchen@hasulam.test | dev-password-kitchen | kitchen | owns 2, 10, 11, 19; sees + edits (accountable) 12, 13, 15, 16, 18 |
| dev-heads@hasulam.test | dev-password-heads | operating_heads | owns 2, 8, 19; sees (read-only) everything below it except 1 (rav_liaison) |
| dev-chef@hasulam.test | dev-password-chef | chef | 13, 15 |
| dev-informed@hasulam.test | dev-password-informed | informed | all 19, read-only |
| dev-outsider@hasulam.test | dev-password-outsider | none | nothing |

## Launch

```bash
.cursor/skills/verify-hasulam-dashboard/scripts/launch.sh
```

Starts dockerd if needed (The Lab: also opens the legacy-iptables FORWARD path between containers), starts Supabase, runs `supabase db reset` (fresh migrations + seed), writes `.env.local`, builds, and starts `next start` on :3000. Ready when it prints `READY http://127.0.0.1:3000`. Refuses if :3000 is taken: one instance per box, never drive someone else's.

## Doctor

```bash
.cursor/skills/verify-hasulam-dashboard/scripts/doctor.sh
```

Read-only. Checks docker, supabase, the 19 seeded tasks, that the app pid is ours, `/signin` answers 200, and dev login is on. Exit 0 means drivable.

## Drive

```bash
.cursor/skills/verify-hasulam-dashboard/scripts/drive.sh            # all journeys in e2e/
.cursor/skills/verify-hasulam-dashboard/scripts/drive.sh -g "marks one done"
```

Playwright, chromium, viewport 390x844, locale he-IL. Handles are `data-testid`s: `sign-in-email`, `sign-in-password`, `sign-in-submit`, `my-tasks-title`, `task-item` (with `data-task-id`, `data-status`), `task-item-toggle` (with `data-next`), `task-item-read-only`, `my-tasks-sign-out`, `sign-in-google`, `not-member`, `event-card` (`data-event-id`), `event-title`, `task-group` (`data-group` = `mine` | role | `unassigned`). New journeys go in `e2e/*.spec.ts`.

## Evidence

Screenshots go to `$EVIDENCE_DIR` (default `/workspace/evidence/`). A proof needs: the real UI path (sign in through the form, click the button), the visible end state (`data-status` changed), and the side effect read straight from Postgres (`public.tasks.status`). The my-tasks spec does all three and restores the row afterwards. Attach the screenshot path and the Playwright output to the handoff.

## Cleanup

```bash
.cursor/skills/verify-hasulam-dashboard/scripts/cleanup.sh
```

Kills only the pid launch.sh recorded, stops Supabase without a backup. Evidence stays.

## Feature map

See `features/README.md`. Update it with `/maintain-verification-skill` after each feature.
