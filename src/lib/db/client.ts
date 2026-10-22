import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { serverEnv } from '@/env';
import type { Database } from './types.gen';

export async function dbClient() {
  // Per-request data: opt out of prerendering before supabase-js reads the clock (Cache Components).
  await connection();
  const env = serverEnv();
  const store = await cookies();
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; proxy refreshes the session instead.
        }
      },
    },
  });
}
