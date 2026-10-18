import 'server-only';
import { serverEnv } from '@/env';
import type { CtaRequest } from '@/lib/cta/registry';

export type DispatchResult =
  | { kind: 'accepted' }
  | { kind: 'not_configured' }
  | { kind: 'failed'; reason: string };

export interface DispatchInput {
  request: CtaRequest;
  idempotencyKey: string;
}

export function dispatchToCalendarKeeper(input: DispatchInput): Promise<DispatchResult> {
  const env = serverEnv();
  if (env.CALENDAR_KEEPER_WEBHOOK_URL === undefined || env.CALENDAR_KEEPER_WEBHOOK_KEY === undefined) {
    return Promise.resolve({ kind: 'not_configured' });
  }
  return Promise.resolve({ kind: 'failed', reason: `slice 1 does not send ${input.request.cta} (${input.idempotencyKey})` });
}
