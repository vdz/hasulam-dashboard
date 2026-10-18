import { z } from 'zod';
import { ctaKindSchema, roleSchema, type CtaKind } from '@/lib/db/enums';
import { eventIdSchema, personIdSchema, taskIdSchema } from '@/lib/db/ids';

const count = z.number().int().nonnegative();

export const ctaPayloadSchemas = {
  request_headcount: z.object({}).strict(),
  ask_rav_theme: z.object({}).strict(),
  request_invitation: z.object({ deadline: z.iso.date().optional() }).strict(),
  remind_team: z.object({ role: roleSchema, task_ids: z.array(taskIdSchema).optional() }).strict(),
  content_prompt: z.object({ topic: z.string().min(1).optional() }).strict(),
  shopping_list: z.object({ menu_text: z.string().min(1).optional(), adults: count.optional(), kids: count.optional() }).strict(),
  record_debrief: z.object({ text: z.string().min(1) }).strict(),
} satisfies Record<CtaKind, z.ZodType>;

const common = { event_id: eventIdSchema, requested_by: personIdSchema, note: z.string().min(1).optional() };

export const ctaRequestSchema = z.discriminatedUnion('cta', [
  z.object({ ...common, cta: z.literal('request_headcount'), payload: ctaPayloadSchemas.request_headcount }),
  z.object({ ...common, cta: z.literal('ask_rav_theme'), payload: ctaPayloadSchemas.ask_rav_theme }),
  z.object({ ...common, cta: z.literal('request_invitation'), payload: ctaPayloadSchemas.request_invitation }),
  z.object({ ...common, cta: z.literal('remind_team'), payload: ctaPayloadSchemas.remind_team }),
  z.object({ ...common, cta: z.literal('content_prompt'), payload: ctaPayloadSchemas.content_prompt }),
  z.object({ ...common, cta: z.literal('shopping_list'), payload: ctaPayloadSchemas.shopping_list }),
  z.object({ ...common, cta: z.literal('record_debrief'), payload: ctaPayloadSchemas.record_debrief }),
]);

export type CtaRequest = z.infer<typeof ctaRequestSchema>;

export const ctaKinds = ctaKindSchema.options;
