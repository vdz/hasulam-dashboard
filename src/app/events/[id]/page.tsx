import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { EventPage } from '@/components/EventPage';
import { getEvent } from '@/lib/db/events';
import { eventIdSchema } from '@/lib/db/ids';
import { requireRole } from '@/lib/db/viewer';

type Params = Promise<{ id: string }>;

async function EventForViewer({ params }: { params: Params }) {
  const viewer = await requireRole();
  const id = eventIdSchema.safeParse(decodeURIComponent((await params).id));
  if (!id.success) notFound();
  const detail = await getEvent(id.data);
  if (detail === null) notFound();
  return <EventPage detail={detail} viewerRoles={viewer.roles} />;
}

export default function EventRoute({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <EventForViewer params={params} />
    </Suspense>
  );
}
