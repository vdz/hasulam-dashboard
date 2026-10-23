import type { Role } from '@/lib/db/enums';
import type { EventDetail } from '@/lib/db/events';

export interface EventPageProps {
  detail: EventDetail;
  viewerRoles: readonly Role[];
}
