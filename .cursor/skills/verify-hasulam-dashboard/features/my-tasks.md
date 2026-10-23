# My tasks

## Sub-features
- Lists tasks whose `owner_roles` include one of the viewer's roles; owner sees all. (Tasks of roles below the viewer are visible on event pages, not here.)
- Open tasks first, then by event date and template order.
- Each card: title, event, due (date from offset, the due note, or "unknown"), status chip.
- Toggle button marks done / back to open; writes `tasks.status` and `updated_by`.

## How to get to it (user POV)
Sign in; `/tasks` is the home page.

## Driving it with Playwright
Count `task-item` (kitchen user: 2). Click `task-item-toggle` inside an item, then expect that `[data-task-id=…]` has `data-status="done"`; read `public.tasks.status` to confirm.

## Gotchas
Toggling re-sorts the list (done moves to the bottom), so re-locate the item by `data-task-id`, not by index.
Kitchen sees tasks 10 and 11 only because the dev seed assigns them; the real feast template leaves them unassigned.
