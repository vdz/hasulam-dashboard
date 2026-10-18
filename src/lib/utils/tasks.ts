import type { TaskStatus } from '@/lib/db/enums';

export type TaskDue =
  | { kind: 'date'; date: Date; offsetDays: number }
  | { kind: 'note'; note: string }
  | { kind: 'unknown' };

const DAY_MS = 24 * 60 * 60 * 1000;

export function taskDue(args: { eventStart: Date; offsetDays: number | null; note: string | null }): TaskDue {
  if (args.offsetDays !== null) {
    return { kind: 'date', date: new Date(args.eventStart.getTime() + args.offsetDays * DAY_MS), offsetDays: args.offsetDays };
  }
  if (args.note !== null) return { kind: 'note', note: args.note };
  return { kind: 'unknown' };
}

export function toggledStatus(status: TaskStatus): TaskStatus {
  switch (status) {
    case 'todo':
      return 'done';
    case 'done':
      return 'todo';
    case 'na':
      return 'todo';
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function isOpen(status: TaskStatus): boolean {
  switch (status) {
    case 'todo':
      return true;
    case 'done':
    case 'na':
      return false;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function sortForViewer<T extends { status: TaskStatus; eventStart: Date; position: number }>(tasks: readonly T[]): T[] {
  return [...tasks].sort(
    (a, b) =>
      Number(isOpen(b.status)) - Number(isOpen(a.status)) ||
      a.eventStart.getTime() - b.eventStart.getTime() ||
      a.position - b.position,
  );
}
