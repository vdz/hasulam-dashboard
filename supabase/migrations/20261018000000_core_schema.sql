create type public.event_type as enum ('feast', 'shabbat', 'experiential_meeting', 'festive_lesson', 'trip', 'birthday');
create type public.role_key as enum (
  'owner', 'operating_heads', 'kitchen', 'invitations', 'content', 'rav_liaison',
  'kids_dept', 'buyer', 'chef', 'women_team', 'men_team', 'calendar_keeper'
);
create type public.task_status as enum ('todo', 'done', 'na');
create type public.cta_kind as enum (
  'request_headcount', 'ask_rav_theme', 'request_invitation', 'remind_team',
  'content_prompt', 'shopping_list', 'record_debrief'
);
create type public.cta_status as enum ('queued', 'drafted', 'awaiting_yehuda', 'sent', 'done', 'failed');
create type public.draft_status as enum ('pending_approval', 'approved', 'rejected', 'sent');

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique check (email = lower(email)),
  whatsapp_id text,
  created_at timestamptz not null default now()
);

create table public.person_roles (
  person_id uuid not null references public.people (id) on delete cascade,
  role public.role_key not null,
  primary key (person_id, role)
);

create table public.events (
  id text primary key,
  title text not null,
  type public.event_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  owner_person_id uuid references public.people (id),
  has_food boolean,
  theme text,
  schedule_text text,
  invitation_status text,
  registration_status text,
  headcount_adults integer check (headcount_adults >= 0),
  headcount_kids integer check (headcount_kids >= 0),
  alert_t14_sent_at timestamptz,
  alert_t7_sent_at timestamptz,
  feedback_summary text,
  lessons_next_year text,
  year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  event_type public.event_type not null,
  position integer not null,
  title text not null,
  owner_role public.role_key,
  due_offset_days integer,
  due_note text,
  unique (event_type, position)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  template_id uuid references public.task_templates (id) on delete set null,
  position integer not null,
  title text not null,
  owner_role public.role_key,
  owner_person_id uuid references public.people (id),
  due_offset_days integer,
  due_note text,
  status public.task_status not null default 'todo',
  notes text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.people (id),
  unique (event_id, position)
);
create index tasks_owner_role_idx on public.tasks (owner_role);

create table public.cta_requests (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  cta public.cta_kind not null,
  requested_by uuid not null references public.people (id),
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  status public.cta_status not null default 'queued',
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  event_id text references public.events (id) on delete cascade,
  cta_request_id uuid references public.cta_requests (id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'email')),
  recipient text not null,
  body text not null,
  status public.draft_status not null default 'pending_approval',
  approved_by uuid references public.people (id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('approved', 'sent')) = (approved_by is not null and approved_at is not null))
);

create table public.history (
  id uuid primary key default gen_random_uuid(),
  event_id text references public.events (id) on delete set null,
  event_title text not null,
  year integer not null,
  role public.role_key not null,
  person_id uuid references public.people (id),
  person_name text,
  notes text
);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();
create trigger cta_requests_touch before update on public.cta_requests for each row execute function public.touch_updated_at();
create trigger drafts_touch before update on public.drafts for each row execute function public.touch_updated_at();

create function public.generate_tasks_for_event(p_event_id text) returns integer
language sql security invoker set search_path = '' as $$
  with inserted as (
    insert into public.tasks (event_id, template_id, position, title, owner_role, due_offset_days, due_note)
    select e.id, t.id, t.position, t.title, t.owner_role, t.due_offset_days, t.due_note
    from public.events e
    join public.task_templates t on t.event_type = e.type
    where e.id = p_event_id
    on conflict (event_id, position) do nothing
    returning 1
  )
  select count(*)::integer from inserted
$$;
