import { z } from 'zod';

export const eventIdSchema = z.string().min(1).brand<'EventId'>();
export const taskIdSchema = z.uuid().brand<'TaskId'>();
export const personIdSchema = z.uuid().brand<'PersonId'>();
export const ctaRequestIdSchema = z.uuid().brand<'CtaRequestId'>();

export type EventId = z.infer<typeof eventIdSchema>;
export type TaskId = z.infer<typeof taskIdSchema>;
export type PersonId = z.infer<typeof personIdSchema>;
export type CtaRequestId = z.infer<typeof ctaRequestIdSchema>;
