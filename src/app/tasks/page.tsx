import { MyTasks } from '@/components/MyTasks';
import { listMyTasks } from '@/lib/db/tasks';
import { requireRole } from '@/lib/db/viewer';
import { sortForViewer } from '@/lib/utils/tasks';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const viewer = await requireRole();
  const tasks = sortForViewer(await listMyTasks());
  return <MyTasks viewerName={viewer.name} tasks={tasks} />;
}
