import { Suspense } from 'react';
import { EventList } from '@/components/EventList';
import { listEvents } from '@/lib/db/events';
import { requireRole } from '@/lib/db/viewer';

// Per-viewer data: never cached; streamed inside Suspense (Cache Components).
async function EventsForViewer() {
  await requireRole();
  return <EventList events={await listEvents()} />;
}

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsForViewer />
    </Suspense>
  );
}
