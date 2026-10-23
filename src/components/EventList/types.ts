import type { EventSummary } from '@/lib/db/events';

export interface EventListProps {
  events: readonly EventSummary[];
}
