# Calendar Keeper access

Calendar Keeper (the bot) reads and writes the store through a dedicated Postgres role, `calendar_keeper`, created in `supabase/migrations/20261018000100_access_control.sql`.

| Can | Cannot |
| --- | --- |
| read every table in `public` | delete anything |
| insert/update `events`, `tasks`, `history` | change who requested a CTA or its payload |
| update `cta_requests.status`, `status_note` | approve drafts (`approved_by`, `approved_at` are not granted) |
| insert drafts and edit `body`, `recipient`, `channel`, `status` | send anything: there is no send path in v1 |
| run `generate_tasks_for_event(event_id)` | |

The role has `bypassrls` so it is not tied to a signed-in person; its column grants are the boundary.

## Turning it on in the cloud project (needs the owner)

The migration creates the role with `nologin`. To let the bot connect:

1. In the Supabase SQL editor: `alter role calendar_keeper with login password '<generated>';`
2. Store the password only on The Lab (for example `~/.secrets/hasulam-calendar-keeper-db`).
3. Connect through the session pooler (host shown in Supabase → Connect) as user `calendar_keeper.kmdlmmokqaxaicwixnjr`.

Drafts become messages only after the owner approves them. A draft can't be `approved` or `sent` without `approved_by` and `approved_at` (table check constraint).
