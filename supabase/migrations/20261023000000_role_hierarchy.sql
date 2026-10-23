-- Role hierarchy + several owner roles per task + one accountable role per task.
-- The hierarchy rows below are PROPOSED DEFAULTS; the owner can change them (they are data, not schema).

create table public.role_hierarchy (
  role public.role_key primary key,
  parent_role public.role_key references public.role_hierarchy (role) on update cascade,
  is_default boolean not null default true,
  check (parent_role is null or parent_role <> role)
);
comment on table public.role_hierarchy is
  'Who sits under whom. A role sees the tasks of every role below it, and edits only tasks it owns or is accountable for. Rows with is_default = true are proposed defaults awaiting the owner''s confirmation.';

insert into public.role_hierarchy (role, parent_role) values ('owner', null);
insert into public.role_hierarchy (role, parent_role) values
  ('operating_heads', 'owner'),
  ('calendar_keeper', 'owner'),
  ('rav_liaison', 'owner');
insert into public.role_hierarchy (role, parent_role) values
  ('kitchen', 'operating_heads'),
  ('invitations', 'operating_heads'),
  ('content', 'operating_heads'),
  ('kids_dept', 'operating_heads');
insert into public.role_hierarchy (role, parent_role) values
  ('chef', 'kitchen'),
  ('buyer', 'kitchen'),
  ('women_team', 'kitchen'),
  ('men_team', 'kitchen');

-- Several owners + one accountable, on templates and tasks.
alter table public.task_templates
  add column owner_roles public.role_key[] not null default '{}',
  add column accountable_role public.role_key;
alter table public.tasks
  add column owner_roles public.role_key[] not null default '{}',
  add column accountable_role public.role_key;

update public.task_templates set owner_roles = array[owner_role] where owner_role is not null;
update public.tasks set owner_roles = array[owner_role] where owner_role is not null;

-- Default accountability: the department head. Team roles under the kitchen answer to the kitchen head;
-- every other owned task is accountable to its own role.
update public.task_templates set accountable_role = case
  when owner_role in ('chef', 'buyer', 'women_team', 'men_team') then 'kitchen'::public.role_key
  else owner_role end;
update public.tasks set accountable_role = case
  when owner_role in ('chef', 'buyer', 'women_team', 'men_team') then 'kitchen'::public.role_key
  else owner_role end;

-- Feast 2 and 19 are shared by the operating heads and the kitchen head; the operating heads are accountable.
update public.task_templates set owner_roles = array['operating_heads', 'kitchen']::public.role_key[], accountable_role = 'operating_heads'
  where event_type = 'feast' and position in (2, 19);

drop policy read_own_role_tasks on public.tasks;
drop policy update_own_role_tasks on public.tasks;
drop function private.can_work_task(public.role_key);
drop index public.tasks_owner_role_idx;
alter table public.task_templates drop column owner_role;
alter table public.tasks drop column owner_role;

alter table public.tasks add constraint tasks_accountable_set
  check (accountable_role is not null or cardinality(owner_roles) = 0);
alter table public.task_templates add constraint task_templates_accountable_set
  check (accountable_role is not null or cardinality(owner_roles) = 0);
create index tasks_owner_roles_idx on public.tasks using gin (owner_roles);

create or replace function public.generate_tasks_for_event(p_event_id text) returns integer
language sql security invoker set search_path = '' as $$
  with inserted as (
    insert into public.tasks (event_id, template_id, position, title, owner_roles, accountable_role, due_offset_days, due_note)
    select e.id, t.id, t.position, t.title, t.owner_roles, t.accountable_role, t.due_offset_days, t.due_note
    from public.events e
    join public.task_templates t on t.event_type = e.type
    where e.id = p_event_id
    on conflict (event_id, position) do nothing
    returning 1
  )
  select count(*)::integer from inserted
$$;

-- The viewer's own roles.
create function private.my_roles() returns public.role_key[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(pr.role), '{}') from public.person_roles pr
  where pr.person_id = private.current_person_id()
$$;

-- The viewer's roles plus every role below them in the hierarchy.
create function private.visible_roles() returns public.role_key[]
language sql stable security definer set search_path = '' as $$
  with recursive below (role) as (
    select pr.role from public.person_roles pr where pr.person_id = private.current_person_id()
    union
    select h.role from public.role_hierarchy h join below b on h.parent_role = b.role
  )
  select coalesce(array_agg(role), '{}') from below
$$;

create function private.can_see_task(p_owner_roles public.role_key[], p_accountable public.role_key) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('owner')
    or p_owner_roles && private.visible_roles()
    or (p_accountable is not null and p_accountable = any (private.visible_roles()))
$$;

create function private.can_edit_task(p_owner_roles public.role_key[], p_accountable public.role_key) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('owner')
    or p_owner_roles && private.my_roles()
    or (p_accountable is not null and p_accountable = any (private.my_roles()))
$$;

grant execute on all functions in schema private to authenticated;

create policy read_visible_tasks on public.tasks for select to authenticated
  using (private.can_see_task(owner_roles, accountable_role));
create policy update_own_tasks on public.tasks for update to authenticated
  using (private.can_edit_task(owner_roles, accountable_role))
  with check (private.can_edit_task(owner_roles, accountable_role) and updated_by = private.current_person_id());

alter table public.role_hierarchy enable row level security;
-- Supabase's default privileges grant ALL on new tables to anon/authenticated; take them back.
revoke all on public.role_hierarchy from anon, authenticated;
grant select on public.role_hierarchy to authenticated;
create policy members_read_hierarchy on public.role_hierarchy for select to authenticated using (private.is_member());

-- Calendar Keeper maintains reference data, including the hierarchy (owner-approved changes only).
grant select, insert, update, delete on public.role_hierarchy to calendar_keeper;
grant select on public.task_templates to calendar_keeper;
