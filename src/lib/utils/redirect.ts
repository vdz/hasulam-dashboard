export const DEFAULT_AFTER_SIGN_IN = '/tasks';

/** Only same-origin absolute paths survive; everything else (//evil, https://, \\) falls back. */
export function safeNextPath(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_AFTER_SIGN_IN;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return DEFAULT_AFTER_SIGN_IN;
  return raw;
}
