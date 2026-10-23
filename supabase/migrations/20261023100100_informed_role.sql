-- Default hierarchy: an informed member sits directly under the owner and has nobody below.
insert into public.role_hierarchy (role, parent_role) values ('informed', 'owner')
  on conflict (role) do nothing;

-- Informed members see every task; they never appear in owner_roles/accountable_role,
-- and private.can_edit_task is unchanged, so they edit nothing.
create or replace function private.can_see_task(p_owner_roles public.role_key[], p_accountable public.role_key) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('owner')
    or private.has_role('informed')
    or p_owner_roles && private.visible_roles()
    or (p_accountable is not null and p_accountable = any (private.visible_roles()))
$$;

-- Nobody does or answers for a task as 'informed'.
alter table public.tasks add constraint tasks_no_informed_owner
  check (not ('informed' = any (owner_roles)) and accountable_role is distinct from 'informed');
alter table public.task_templates add constraint task_templates_no_informed_owner
  check (not ('informed' = any (owner_roles)) and accountable_role is distinct from 'informed');
