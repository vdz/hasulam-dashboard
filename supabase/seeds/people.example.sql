-- Template for supabase/seeds/private/people.sql (git-ignored; holds real names).
-- Copy it there and fill in real names. Local `supabase db reset` loads it if present.
-- For the cloud project, run the real file once in the Supabase SQL editor.
with p as (
  insert into public.people (name) values
    ('<operating head 1>'), ('<operating head 2>'), ('<kitchen lead>'), ('<invitations lead>'),
    ('<content lead>'), ('<rav liaison>'), ('<owner>')
  returning id, name
)
insert into public.person_roles (person_id, role)
select id, case name
  when '<operating head 1>' then 'operating_heads'
  when '<operating head 2>' then 'operating_heads'
  when '<kitchen lead>' then 'kitchen'
  when '<invitations lead>' then 'invitations'
  when '<content lead>' then 'content'
  when '<rav liaison>' then 'rav_liaison'
  when '<owner>' then 'owner'
end::public.role_key
from p;
