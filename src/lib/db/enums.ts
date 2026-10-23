import { z } from 'zod';
import { Constants } from './types.gen';

const enums = Constants.public.Enums;

export const roleSchema = z.enum(enums.role_key);
export const taskStatusSchema = z.enum(enums.task_status);
export const eventTypeSchema = z.enum(enums.event_type);
export const ctaKindSchema = z.enum(enums.cta_kind);
export const ctaStatusSchema = z.enum(enums.cta_status);
export const draftStatusSchema = z.enum(enums.draft_status);

export type Role = z.infer<typeof roleSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
export type CtaKind = z.infer<typeof ctaKindSchema>;
export type CtaStatus = z.infer<typeof ctaStatusSchema>;

/** Display order for role groups: the order of the role_key enum. */
export const roleOrder: readonly Role[] = enums.role_key;
