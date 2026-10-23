'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverEnv } from '@/env';
import { devSignInWithPassword, googleSignInUrl, signOut } from '@/lib/db/viewer';
import { safeNextPath } from '@/lib/utils/redirect';

const devSignInInput = z.object({ email: z.email(), password: z.string().min(1) });

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = z.string().min(1).parse(h.get('x-forwarded-host') ?? h.get('host'));
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function googleSignInAction(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get('next'));
  const callbackUrl = `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
  const url = await googleSignInUrl({ callbackUrl });
  redirect(url ?? '/signin?failed=1');
}

export async function devSignInAction(formData: FormData): Promise<void> {
  if (!serverEnv().DEV_LOGIN_ENABLED) redirect('/signin');
  const input = devSignInInput.safeParse({ email: formData.get('email'), password: formData.get('password') });
  const ok = input.success && (await devSignInWithPassword(input.data));
  redirect(ok ? safeNextPath(formData.get('next')) : '/signin?failed=1');
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect('/signin');
}
