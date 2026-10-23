import { Suspense } from 'react';
import { MyTasks } from '@/components/MyTasks';
import { listMyTasks } from '@/lib/db/tasks';
import { requireRole } from '@/lib/db/viewer';
import { sortForViewer } from '@/lib/utils/tasks';

// Per-viewer data: never cached; streamed inside Suspense so the static shell prerenders (Cache Components).
async function MyTasksForViewer() {
  const viewer = await requireRole();
  const tasks = sortForViewer(await listMyTasks(viewer));
  return <MyTasks viewerName={viewer.name} tasks={tasks} />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <MyTasksForViewer />
    </Suspense>
  );
}
