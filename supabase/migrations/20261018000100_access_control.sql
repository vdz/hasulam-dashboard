create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.current_person_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.people p
  where p.email is not null and p.email = lower(auth.jwt() ->> 'email')
$$;

create function private.has_role(r public.role_key) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.person_roles pr
    where pr.person_id = private.current_person_id() and pr.role = r
  )
$$;

create function private.is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.current_person_id() is not null
$$;

create function private.can_work_task(task_role public.role_key) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('owner') or (task_role is not null and private.has_role(task_role))
$$;

grant execute on all functions in schema private to authenticated;

alter table public.people enable row level security;
alter table public.person_roles enable row level security;
alter table public.events enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;
alter table public.cta_requests enable row level security;
alter table public.drafts enable row level security;
alter table public.history enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.people, public.person_roles, public.events, public.task_templates,
  public.tasks, public.cta_requests, public.drafts, public.history to authenticated;
grant update (status, notes, updated_by) on public.tasks to authenticated;
grant insert (event_id, cta, requested_by, payload, idempotency_key) on public.cta_requests to authenticated;

create policy members_read_people on public.people for select to authenticated using (private.is_member());
create policy members_read_roles on public.person_roles for select to authenticated using (private.is_member());
create policy members_read_events on public.events for select to authenticated using (private.is_member());
create policy members_read_templates on public.task_templates for select to authenticated using (private.is_member());
create policy members_read_history on public.history for select to authenticated using (private.is_member());

create policy read_own_role_tasks on public.tasks for select to authenticated
  using (private.can_work_task(owner_role));
create policy update_own_role_tasks on public.tasks for update to authenticated
  using (private.can_work_task(owner_role))
  with check (private.can_work_task(owner_role) and updated_by = private.current_person_id());

create policy read_cta_requests on public.cta_requests for select to authenticated
  using (private.has_role('owner') or requested_by = private.current_person_id());
create policy create_own_cta_requests on public.cta_requests for insert to authenticated
  with check (private.is_member() and requested_by = private.current_person_id());

create policy owner_reads_drafts on public.drafts for select to authenticated
  using (private.has_role('owner'));

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'calendar_keeper') then
    create role calendar_keeper nologin bypassrls;
  end if;
end $$;
grant calendar_keeper to postgres with inherit false, set true;
grant usage on schema public to calendar_keeper;
grant select on all tables in schema public to calendar_keeper;
grant insert, update on public.events, public.tasks, public.history to calendar_keeper;
grant update (status, status_note) on public.cta_requests to calendar_keeper;
grant insert, update (body, recipient, channel, status) on public.drafts to calendar_keeper;
grant execute on function public.generate_tasks_for_event(text) to calendar_keeper;
