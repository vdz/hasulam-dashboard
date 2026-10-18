import { describe, expect, it } from 'vitest';
import { ctaKinds, ctaPayloadSchemas, ctaRequestSchema } from '../registry';

const base = { event_id: 'gcal-123', requested_by: '6f1c2a52-6a0e-4d43-9f3f-1f3c2b1a0e11' };

describe('CTA registry', () => {
  it('has a payload schema for every CTA kind in the database enum', () => {
    expect(Object.keys(ctaPayloadSchemas).sort()).toEqual([...ctaKinds].sort());
  });

  it('accepts a debrief with text and rejects one without', () => {
    expect(ctaRequestSchema.safeParse({ ...base, cta: 'record_debrief', payload: { text: 'לקח' } }).success).toBe(true);
    expect(ctaRequestSchema.safeParse({ ...base, cta: 'record_debrief', payload: {} }).success).toBe(false);
  });

  it('rejects fields a CTA does not define', () => {
    expect(ctaRequestSchema.safeParse({ ...base, cta: 'request_headcount', payload: { adults: 3 } }).success).toBe(false);
  });

  it('requires a known role for team reminders', () => {
    expect(ctaRequestSchema.safeParse({ ...base, cta: 'remind_team', payload: { role: 'kitchen' } }).success).toBe(true);
    expect(ctaRequestSchema.safeParse({ ...base, cta: 'remind_team', payload: { role: 'janitor' } }).success).toBe(false);
  });
});
