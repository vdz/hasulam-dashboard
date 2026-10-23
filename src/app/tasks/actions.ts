'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { taskStatusSchema } from '@/lib/db/enums';
import { taskIdSchema } from '@/lib/db/ids';
import { setTaskStatus } from '@/lib/db/tasks';
import { requireRole } from '@/lib/db/viewer';

const setStatusInput = z.object({ taskId: taskIdSchema, status: taskStatusSchema });

export async function setStatusAction(formData: FormData): Promise<void> {
  const viewer = await requireRole();
  const input = setStatusInput.parse({ taskId: formData.get('taskId'), status: formData.get('status') });
  const updated = await setTaskStatus({ viewer, taskId: input.taskId, status: input.status });
  if (!updated) throw new Error('task not found or not yours');
  revalidatePath('/', 'layout');
}
