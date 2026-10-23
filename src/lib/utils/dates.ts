const eventDate = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem',
});

export function formatEventDate(date: Date): string {
  return eventDate.format(date);
}
