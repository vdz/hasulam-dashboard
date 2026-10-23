import Link from 'next/link';
import { fill, text } from '@/assets/locales';
import { TaskItem } from '@/components/TaskItem';
import { roleOrder } from '@/lib/db/enums';
import type { EventTask } from '@/lib/db/events';
import { formatEventDate } from '@/lib/utils/dates';
import { canEditTask, groupTasksForViewer, type TaskGroupKey } from '@/lib/utils/eventTasks';
import styles from './EventPage.module.css';
import type { EventPageProps } from './types';

function groupTitle(key: TaskGroupKey): string {
  switch (key.kind) {
    case 'mine':
      return text.events.mine;
    case 'role':
      return text.roles[key.role];
    case 'unassigned':
      return text.events.unassigned;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

function groupId(key: TaskGroupKey): string {
  return key.kind === 'role' ? key.role : key.kind;
}

function taskContext(task: EventTask): string {
  const owners = task.ownerRoles.map((r) => text.roles[r]).join(' + ');
  const accountable = task.accountableRole !== null && task.ownerRoles.length > 1
    ? ` (${fill(text.events.accountable, { role: text.roles[task.accountableRole] })})`
    : '';
  return owners.length > 0 ? `${owners}${accountable}` : text.events.unassigned;
}

export function EventPage({ detail, viewerRoles }: EventPageProps) {
  const { event, tasks } = detail;
  const groups = groupTasksForViewer(tasks, viewerRoles, roleOrder);
  return (
    <main className={styles.page} data-testid="event-page" data-event-id={event.id}>
      <Link className={styles.navLink} href="/events" data-testid="event-back">{text.events.back}</Link>
      <header>
        <h1 className={styles.title} data-testid="event-title">{event.title}</h1>
        <p className={styles.meta}>
          {text.eventTypes[event.type]} · {formatEventDate(event.startsAt)}
          {event.location !== null && ` · ${event.location}`}
        </p>
      </header>
      {groups.length === 0 && <p className={styles.empty} data-testid="event-no-tasks">{text.events.noTasks}</p>}
      {groups.map((group) => (
        <section key={groupId(group.key)} className={styles.group} data-testid="task-group" data-group={groupId(group.key)}>
          <h2 className={styles.groupTitle}>
            {groupTitle(group.key)} <span className={styles.count}>{group.tasks.length}</span>
          </h2>
          <ul className={styles.list}>
            {group.tasks.map((task) => (
              <TaskItem key={task.id} task={task} context={taskContext(task)} editable={canEditTask(viewerRoles, task)} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
