-- 'informed': reads every task, edits nothing, accountable for nothing (kept apart so the value commits before use).
alter type public.role_key add value if not exists 'informed';
