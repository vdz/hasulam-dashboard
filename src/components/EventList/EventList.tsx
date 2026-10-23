import Link from 'next/link';
import { text } from '@/assets/locales';
import { formatEventDate } from '@/lib/utils/dates';
import styles from './EventList.module.css';
import type { EventListProps } from './types';

export function EventList({ events }: EventListProps) {
  return (
    <main className={styles.page} data-testid="event-list">
      <Link className={styles.navLink} href="/tasks" data-testid="nav-my-tasks">{text.nav.myTasks}</Link>
      <h1 className={styles.title} data-testid="event-list-title">{text.events.title}</h1>
      {events.length === 0 ? (
        <p className={styles.empty} data-testid="event-list-empty">{text.events.empty}</p>
      ) : (
        <ul className={styles.list}>
          {events.map((event) => (
            <li key={event.id}>
              <Link className={styles.card} href={`/events/${encodeURIComponent(event.id)}`} data-testid="event-card" data-event-id={event.id}>
                <span className={styles.cardTitle}>{event.title}</span>
                <span className={styles.meta}>
                  {text.eventTypes[event.type]} · {formatEventDate(event.startsAt)}
                  {event.location !== null && ` · ${event.location}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
