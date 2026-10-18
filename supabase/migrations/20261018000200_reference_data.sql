-- Real people and their roles are NOT in the repo: see supabase/seeds/people.example.sql and docs/secrets.md.

insert into public.task_templates (event_type, position, title, owner_role, due_offset_days, due_note) values
  ('feast', 1, 'שאלת הרב על נושא מוצע/מבוקש לסעודה ← דיווח לבעלים', 'rav_liaison', -28, null),
  ('feast', 2, 'קביעת נושא, תאריך ולו"ז ופרסומם (באישור הבעלים)', 'operating_heads', null, 'בהקדם האפשרי אחרי משימה 1'),
  ('feast', 3, 'פניית תוכן לבעלים (להעברה למחלקת התוכן של the content lead)', 'calendar_keeper', null, 'הצעה: מיד אחרי קביעת הנושא'),
  ('feast', 4, 'פעילות/משחק של מחלקת הילדים', 'kids_dept', null, null),
  ('feast', 5, 'בקשת הזמנה', 'invitations', null, 'הצעה: אחרי קביעת הנושא'),
  ('feast', 6, 'התראה ראשונה (באישור הבעלים)', 'calendar_keeper', -14, null),
  ('feast', 7, 'פתיחת הרשמה', null, null, null),
  ('feast', 8, 'קבלת מספרי משתתפים: מבוגרים (ברירת מחדל) + ילדים בנפרד', 'operating_heads', null, null),
  ('feast', 9, 'התראה שנייה (באישור הבעלים)', 'calendar_keeper', -7, null),
  ('feast', 10, 'תפריט (מבוגרים + תפריט ילדים נפרד)', null, null, null),
  ('feast', 11, 'רשימת קניות מתוך התפריט', null, null, null),
  ('feast', 12, 'רכישה', 'buyer', null, null),
  ('feast', 13, 'תכנון ההכנות (בפיקוח אחראית המטבח)', 'chef', null, null),
  ('feast', 14, 'חלוקת משימות הכנה לקבוצה קהילתית', null, null, null),
  ('feast', 15, 'בישול', 'chef', 0, null),
  ('feast', 16, 'הגשה למגשים', 'women_team', 0, null),
  ('feast', 17, 'הגשה ראשונה לרב ולרבנית', null, 0, null),
  ('feast', 18, 'חלוקת מגשים בחדר האוכל', 'men_team', 0, null),
  ('feast', 19, 'תחקיר ולקחים לשנה הבאה (תיעוד ברשומת האירוע)', 'operating_heads', 1, null);
