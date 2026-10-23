import 'server-only';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverEnv } from '@/env';
import { roleSchema, type Role } from './enums';
import { personIdSchema, type PersonId } from './ids';
import { dbClient } from './client';

export interface Viewer {
  personId: PersonId;
  name: string;
  email: string;
  roles: readonly Role[];
}

export type ViewerState =
  | { kind: 'anonymous' }
  | { kind: 'not_member'; email: string }
  | { kind: 'member'; viewer: Viewer };

const personRowSchema = z.object({
  id: personIdSchema,
  name: z.string(),
  person_roles: z.array(z.object({ role: roleSchema })),
});

export async function viewerState(): Promise<ViewerState> {
  const db = await dbClient();
  const { data: auth } = await db.auth.getUser();
  const email = auth.user?.email?.toLowerCase();
  if (email === undefined) return { kind: 'anonymous' };
  // RLS returns no people rows to non-members, so a missing row means "not a member".
  const { data, error } = await db.from('people').select('id, name, person_roles(role)').eq('email', email).maybeSingle();
  if (error) throw new Error(`viewer lookup failed: ${error.message}`);
  if (data === null) return { kind: 'not_member', email };
  const row = personRowSchema.parse(data);
  return { kind: 'member', viewer: { personId: row.id, name: row.name, email, roles: row.person_roles.map((r) => r.role) } };
}

/** The one gate for pages and actions. */
export async function requireRole(...allowed: Role[]): Promise<Viewer> {
  const state = await viewerState();
  switch (state.kind) {
    case 'anonymous':
      redirect('/signin');
    // falls through: redirect() never returns
    case 'not_member':
      redirect('/not-a-member');
    // falls through: redirect() never returns
    case 'member': {
      const { viewer } = state;
      const permitted = allowed.length === 0 || viewer.roles.some((r) => r === 'owner' || allowed.includes(r));
      if (!permitted) redirect('/signin?denied=1');
      return viewer;
    }
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

/** Starts Google OAuth (PKCE; the verifier is stored in a cookie) and returns the provider URL. */
export async function googleSignInUrl(args: { callbackUrl: string }): Promise<string | null> {
  const db = await dbClient();
  const { data, error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: args.callbackUrl, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (error !== null) return null;
  return data.url;
}

export async function completeSignIn(code: string): Promise<boolean> {
  const db = await dbClient();
  const { error } = await db.auth.exchangeCodeForSession(code);
  return error === null;
}

/** Dev/test only. Refused unless DEV_LOGIN_ENABLED, which env.ts forbids in production and against the cloud project. */
export async function devSignInWithPassword(args: { email: string; password: string }): Promise<boolean> {
  if (!serverEnv().DEV_LOGIN_ENABLED) return false;
  const db = await dbClient();
  const { error } = await db.auth.signInWithPassword(args);
  return error === null;
}

export async function signOut(): Promise<void> {
  const db = await dbClient();
  await db.auth.signOut();
}
