'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverEnv } from '@/env';
import { signInWithPassword } from '@/lib/db/viewer';

const devSignInInput = z.object({ email: z.email(), password: z.string().min(1) });

export async function devSignInAction(formData: FormData): Promise<void> {
  if (!serverEnv().DEV_LOGIN_ENABLED) redirect('/signin');
  const input = devSignInInput.safeParse({ email: formData.get('email'), password: formData.get('password') });
  const ok = input.success && (await signInWithPassword(input.data));
  redirect(ok ? '/tasks' : '/signin?failed=1');
}
