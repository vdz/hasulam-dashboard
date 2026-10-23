import 'server-only';
import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

// Server-only names. Never prefix with NEXT_PUBLIC_; scripts/check-client-secrets.mjs enforces.
export const SERVER_SECRET_NAMES = ['CALENDAR_KEEPER_WEBHOOK_URL', 'CALENDAR_KEEPER_WEBHOOK_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_DB_URL'] as const;

const serverSchema = publicSchema.extend({
  DEV_LOGIN_ENABLED: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  CALENDAR_KEEPER_WEBHOOK_URL: z.url().optional(),
  CALENDAR_KEEPER_WEBHOOK_KEY: z.string().min(1).optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
})
  .refine((env) => !(env.DEV_LOGIN_ENABLED && env.VERCEL_ENV === 'production'), {
    message: 'DEV_LOGIN_ENABLED must never be true in Vercel production',
  })
  .refine((env) => !(env.DEV_LOGIN_ENABLED && isCloudSupabase(env.NEXT_PUBLIC_SUPABASE_URL)), {
    message: 'DEV_LOGIN_ENABLED only works against a local Supabase; the cloud project is Google sign-in only',
  });

function isCloudSupabase(url: string): boolean {
  return new URL(url).hostname.endsWith('.supabase.co');
}

export type ServerEnv = z.infer<typeof serverSchema>;

export function serverEnv(): ServerEnv {
  return serverSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEV_LOGIN_ENABLED: process.env.DEV_LOGIN_ENABLED,
    CALENDAR_KEEPER_WEBHOOK_URL: process.env.CALENDAR_KEEPER_WEBHOOK_URL || undefined,
    CALENDAR_KEEPER_WEBHOOK_KEY: process.env.CALENDAR_KEEPER_WEBHOOK_KEY || undefined,
    VERCEL_ENV: process.env.VERCEL_ENV || undefined,
  });
}
