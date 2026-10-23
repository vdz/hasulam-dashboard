import type { TaskStatus } from '@/lib/db/enums';
import type { TaskId } from '@/lib/db/ids';

export interface TaskView {
  id: TaskId;
  title: string;
  status: TaskStatus;
  dueOffsetDays: number | null;
  dueNote: string | null;
  eventStart: Date;
}

export interface TaskItemProps {
  task: TaskView;
  /** First part of the meta line: the event title, or the owner roles on an event page. */
  context: string;
  editable: boolean;
}
