import { describe, expect, it } from 'vitest';
import { DEFAULT_AFTER_SIGN_IN, safeNextPath } from '../redirect';

describe('safeNextPath', () => {
  it('keeps same-origin paths', () => {
    expect(safeNextPath('/events/abc?x=1')).toBe('/events/abc?x=1');
  });
  it.each([null, undefined, '', 'events', '//evil.example', 'https://evil.example', '/\\evil.example'])('rejects %s', (raw) => {
    expect(safeNextPath(raw)).toBe(DEFAULT_AFTER_SIGN_IN);
  });
});
