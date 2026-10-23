import { fill, text } from '@/assets/locales';
import { setStatusAction } from '@/app/tasks/actions';
import type { TaskStatus } from '@/lib/db/enums';
import { taskDue, toggledStatus, type TaskDue } from '@/lib/utils/tasks';
import styles from './TaskItem.module.css';
import type { TaskItemProps } from './types';

const dateFormat = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem' });

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return text.myTasks.open;
    case 'done':
      return text.myTasks.done;
    case 'na':
      return text.myTasks.notApplicable;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function dueLabel(due: TaskDue): string {
  switch (due.kind) {
    case 'date':
      return fill(text.myTasks.dueDate, { date: dateFormat.format(due.date) });
    case 'note':
      return due.note;
    case 'unknown':
      return text.myTasks.dueUnknown;
    default: {
      const exhaustive: never = due;
      return exhaustive;
    }
  }
}

export function TaskItem({ task, context, editable }: TaskItemProps) {
  const due = taskDue({ eventStart: task.eventStart, offsetDays: task.dueOffsetDays, note: task.dueNote });
  const next = toggledStatus(task.status);

  return (
    <li className={styles.item} data-testid="task-item" data-task-id={task.id} data-status={task.status} data-editable={editable}>
      <div className={styles.body}>
        <p className={styles.title} data-testid="task-item-title">{task.title}</p>
        <p className={styles.meta} data-testid="task-item-meta">
          {context} · {dueLabel(due)}
        </p>
        <span className={styles.status} data-testid="task-item-status" data-status={task.status}>
          {statusLabel(task.status)}
        </span>
      </div>
      {editable ? (
      <form action={setStatusAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="status" value={next} />
        <button className={styles.toggle} data-testid="task-item-toggle" data-next={next} type="submit">
          {next === 'done' ? text.myTasks.markDone : text.myTasks.markOpen}
        </button>
      </form>
      ) : (
        <span className={styles.readOnly} data-testid="task-item-read-only">{text.events.readOnly}</span>
      )}
    </li>
  );
}
