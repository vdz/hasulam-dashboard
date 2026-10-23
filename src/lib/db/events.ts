import 'server-only';
import { z } from 'zod';
import { eventTypeSchema, roleSchema, taskStatusSchema, type EventType, type Role, type TaskStatus } from './enums';
import { eventIdSchema, taskIdSchema, type EventId, type TaskId } from './ids';
import { dbClient } from './client';

const eventRowSchema = z.object({
  id: eventIdSchema,
  title: z.string(),
  type: eventTypeSchema,
  starts_at: z.iso.datetime({ offset: true }),
  location: z.string().nullable(),
});

export interface EventSummary {
  id: EventId;
  title: string;
  type: EventType;
  startsAt: Date;
  location: string | null;
}

function toSummary(row: z.infer<typeof eventRowSchema>): EventSummary {
  return { id: row.id, title: row.title, type: row.type, startsAt: new Date(row.starts_at), location: row.location };
}

export async function listEvents(): Promise<EventSummary[]> {
  const db = await dbClient();
  const { data, error } = await db.from('events').select('id, title, type, starts_at, location').order('starts_at');
  if (error) throw new Error(`listing events failed: ${error.message}`);
  return z.array(eventRowSchema).parse(data).map(toSummary);
}

const eventTaskRowSchema = z.object({
  id: taskIdSchema,
  title: z.string(),
  status: taskStatusSchema,
  position: z.number().int(),
  owner_roles: z.array(roleSchema),
  accountable_role: roleSchema.nullable(),
  due_offset_days: z.number().int().nullable(),
  due_note: z.string().nullable(),
});

export interface EventTask {
  id: TaskId;
  title: string;
  status: TaskStatus;
  position: number;
  ownerRoles: readonly Role[];
  accountableRole: Role | null;
  dueOffsetDays: number | null;
  dueNote: string | null;
  eventStart: Date;
}

export interface EventDetail {
  event: EventSummary;
  tasks: EventTask[];
}

/** Tasks come back already filtered by RLS: own roles, roles below, or all for the owner. */
export async function getEvent(id: EventId): Promise<EventDetail | null> {
  const db = await dbClient();
  const { data: eventRow, error: eventError } = await db.from('events').select('id, title, type, starts_at, location').eq('id', id).maybeSingle();
  if (eventError) throw new Error(`loading event failed: ${eventError.message}`);
  if (eventRow === null) return null;
  const event = toSummary(eventRowSchema.parse(eventRow));
  const { data, error } = await db
    .from('tasks')
    .select('id, title, status, position, owner_roles, accountable_role, due_offset_days, due_note')
    .eq('event_id', id)
    .order('position');
  if (error) throw new Error(`loading event tasks failed: ${error.message}`);
  const tasks = z.array(eventTaskRowSchema).parse(data).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    position: row.position,
    ownerRoles: row.owner_roles,
    accountableRole: row.accountable_role,
    dueOffsetDays: row.due_offset_days,
    dueNote: row.due_note,
    eventStart: event.startsAt,
  }));
  return { event, tasks };
}
