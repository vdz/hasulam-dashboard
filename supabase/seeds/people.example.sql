-- Template for supabase/seeds/private/people.sql (git-ignored; holds real names).
-- Copy it there and fill in real names. Local `supabase db reset` loads it if present.
-- 'informed' = reads every task, edits nothing, accountable for nothing.
-- Add each person's Google (Gmail) address in people.email, lower-case, or they cannot sign in.
-- The cloud project was seeded once via a temporary GitHub Action secret (never committed).
with p as (
  insert into public.people (name) values
    ('<operating head>'), ('<informed member>'), ('<kitchen lead>'), ('<invitations lead>'),
    ('<content lead>'), ('<rav liaison>'), ('<owner>')
  returning id, name
)
insert into public.person_roles (person_id, role)
select id, case name
  when '<operating head>' then 'operating_heads'
  when '<informed member>' then 'informed'
  when '<kitchen lead>' then 'kitchen'
  when '<invitations lead>' then 'invitations'
  when '<content lead>' then 'content'
  when '<rav liaison>' then 'rav_liaison'
  when '<owner>' then 'owner'
end::public.role_key
from p;
