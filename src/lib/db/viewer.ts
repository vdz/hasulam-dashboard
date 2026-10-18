import 'server-only';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { roleSchema, type Role } from './enums';
import { personIdSchema, type PersonId } from './ids';
import { dbClient } from './client';


export interface Viewer {
  personId: PersonId;
  name: string;
  roles: readonly Role[];
}

const personRowSchema = z.object({
  id: personIdSchema,
  name: z.string(),
  person_roles: z.array(z.object({ role: roleSchema })),
});

export async function currentViewer(): Promise<Viewer | null> {
  const db = await dbClient();
  const { data: auth } = await db.auth.getUser();
  const email = auth.user?.email?.toLowerCase();
  if (email === undefined) return null;
  const { data, error } = await db.from('people').select('id, name, person_roles(role)').eq('email', email).maybeSingle();
  if (error) throw new Error(`viewer lookup failed: ${error.message}`);
  if (data === null) return null;
  const row = personRowSchema.parse(data);
  return { personId: row.id, name: row.name, roles: row.person_roles.map((r) => r.role) };
}

export async function requireRole(...allowed: Role[]): Promise<Viewer> {
  const viewer = await currentViewer();
  if (viewer === null) redirect('/signin');
  const permitted = allowed.length === 0 || viewer.roles.some((r) => r === 'owner' || allowed.includes(r));
  if (!permitted) redirect('/signin?denied=1');
  return viewer;
}

export async function signInWithPassword(args: { email: string; password: string }): Promise<boolean> {
  const db = await dbClient();
  const { error } = await db.auth.signInWithPassword(args);
  return error === null;
}

export async function signOut(): Promise<void> {
  const db = await dbClient();
  await db.auth.signOut();
}
