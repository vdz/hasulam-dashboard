import type { MyTask } from '@/lib/db/tasks';

export interface MyTasksProps {
  viewerName: string;
  tasks: readonly MyTask[];
}
