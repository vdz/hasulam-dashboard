-- Local/dev only. Never applied to the cloud project.
create or replace function pg_temp.dev_user(p_email text, p_password text) returns void language plpgsql as $$
declare uid uuid := gen_random_uuid();
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', p_email), 'email', now(), now(), now());
end $$;

select pg_temp.dev_user('dev-owner@hasulam.test', 'dev-password-owner');
select pg_temp.dev_user('dev-kitchen@hasulam.test', 'dev-password-kitchen');
select pg_temp.dev_user('dev-heads@hasulam.test', 'dev-password-heads');
select pg_temp.dev_user('dev-outsider@hasulam.test', 'dev-password-outsider');
select pg_temp.dev_user('dev-chef@hasulam.test', 'dev-password-chef');
select pg_temp.dev_user('dev-informed@hasulam.test', 'dev-password-informed');

with p as (
  insert into public.people (name, email) values
    ('בודק בעלים', 'dev-owner@hasulam.test'),
    ('בודקת מטבח', 'dev-kitchen@hasulam.test'),
    ('בודק תפעול', 'dev-heads@hasulam.test'),
    ('בודק בישול', 'dev-chef@hasulam.test'),
    ('בודקת מעודכנת', 'dev-informed@hasulam.test')
  returning id, email
)
insert into public.person_roles (person_id, role)
select id, case email
  when 'dev-owner@hasulam.test' then 'owner'
  when 'dev-kitchen@hasulam.test' then 'kitchen'
  when 'dev-heads@hasulam.test' then 'operating_heads'
  when 'dev-chef@hasulam.test' then 'chef'
  when 'dev-informed@hasulam.test' then 'informed'
end::public.role_key from p;

insert into public.events (id, title, type, starts_at, has_food, year)
values ('dev-feast-1', 'סעודת בדיקה', 'feast', '2026-12-01 18:00+02', true, 2026);
select public.generate_tasks_for_event('dev-feast-1');
update public.tasks set owner_roles = '{kitchen}', accountable_role = 'kitchen' where event_id = 'dev-feast-1' and position in (10, 11);
