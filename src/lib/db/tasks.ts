import 'server-only';
import { z } from 'zod';
import { roleSchema, taskStatusSchema, type Role, type TaskStatus } from './enums';
import { eventIdSchema, taskIdSchema, type TaskId } from './ids';
import { dbClient } from './client';
import type { Viewer } from './viewer';

const taskRowSchema = z.object({
  id: taskIdSchema,
  title: z.string(),
  status: taskStatusSchema,
  position: z.number().int(),
  owner_role: roleSchema.nullable(),
  due_offset_days: z.number().int().nullable(),
  due_note: z.string().nullable(),
  event: z.object({ id: eventIdSchema, title: z.string(), starts_at: z.iso.datetime({ offset: true }) }),
});

export interface MyTask {
  id: TaskId;
  title: string;
  status: TaskStatus;
  position: number;
  ownerRole: Role | null;
  dueOffsetDays: number | null;
  dueNote: string | null;
  eventTitle: string;
  eventStart: Date;
}

export async function listMyTasks(): Promise<MyTask[]> {
  const db = await dbClient();
  const { data, error } = await db
    .from('tasks')
    .select('id, title, status, position, owner_role, due_offset_days, due_note, event:events!inner(id, title, starts_at)');
  if (error) throw new Error(`listing tasks failed: ${error.message}`);
  return z.array(taskRowSchema).parse(data).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    position: row.position,
    ownerRole: row.owner_role,
    dueOffsetDays: row.due_offset_days,
    dueNote: row.due_note,
    eventTitle: row.event.title,
    eventStart: new Date(row.event.starts_at),
  }));
}

export async function setTaskStatus(args: { viewer: Viewer; taskId: TaskId; status: TaskStatus }): Promise<boolean> {
  const db = await dbClient();
  const { data, error } = await db
    .from('tasks')
    .update({ status: args.status, updated_by: args.viewer.personId })
    .eq('id', args.taskId)
    .select('id');
  if (error) throw new Error(`updating task failed: ${error.message}`);
  return data.length === 1;
}
