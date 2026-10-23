# Role hierarchy (proposed defaults)

Stored in `public.role_hierarchy` (data, not code). Every row has `is_default = true` until the owner confirms it;
Calendar Keeper may change rows only with the owner's approval.

```
owner
├── operating_heads
│   ├── kitchen            (department head)
│   │   ├── chef
│   │   ├── buyer
│   │   ├── women_team
│   │   └── men_team
│   ├── invitations
│   ├── content
│   └── kids_dept
├── calendar_keeper
└── rav_liaison
```

Rules (enforced by RLS, tested in `supabase/tests/rls.test.ts`):
- A task has **several owner roles** (`tasks.owner_roles`) and **one accountable role** (`tasks.accountable_role`, required when there are owners).
- **See**: the owner sees all; otherwise you see a task if one of its owner roles or its accountable role is yours **or below yours**.
- **Edit** (status, notes): the owner; otherwise only if you are one of its owners or its accountable role. A higher role sees the tasks below it but cannot edit them.
- Default accountability: tasks of the kitchen teams (chef, buyer, women_team, men_team) are accountable to `kitchen`; other tasks to their own role.
- Feast tasks 2 and 19: owners `operating_heads` + `kitchen`, accountable `operating_heads`.

Open for the owner: the placement of each role above, and whether "accountable" should also grant edit (it does by default).
