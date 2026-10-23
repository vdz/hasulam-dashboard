# Event pages

## Sub-features
- `/events`: every event (members only), date in Asia/Jerusalem, links to `/events/<id>`.
- `/events/<id>`: tasks RLS lets the viewer see. First group `mine` (owner, co-owner or accountable; editable), then one group per first owner role in enum order, then `unassigned`. Tasks the viewer cannot edit show `task-item-read-only` instead of a toggle.
- Unknown id → `not-found` screen (status is 200 because the page streams).

## Driving it with Playwright
Sign in as `dev-heads` via `/signin?next=/events`, click `[data-event-id="dev-feast-1"]`. Expect `mine` with 3 tasks, `[data-group="kitchen"]` with 2 read-only tasks, no `rav_liaison` group. See `e2e/events.spec.ts`.

## Gotchas
- Edit permission in the UI (`canEditTask`) mirrors `private.can_edit_task`; RLS is the gate. If they drift, the RLS tests catch the server side, not the UI.
- Grouping uses `owner_roles[0]`; a shared task appears once.
