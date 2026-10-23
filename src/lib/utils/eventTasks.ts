import type { Role } from '@/lib/db/enums';

export interface RoleScopedTask {
  ownerRoles: readonly Role[];
  accountableRole: Role | null;
  position: number;
}

/** UI mirror of private.can_edit_task (RLS is the real gate). */
export function canEditTask(viewerRoles: readonly Role[], task: RoleScopedTask): boolean {
  if (viewerRoles.includes('owner')) return true;
  if (task.ownerRoles.some((r) => viewerRoles.includes(r))) return true;
  return task.accountableRole !== null && viewerRoles.includes(task.accountableRole);
}

export type TaskGroupKey = { kind: 'mine' } | { kind: 'role'; role: Role } | { kind: 'unassigned' };

export interface TaskGroup<T> {
  key: TaskGroupKey;
  tasks: T[];
}

/**
 * The viewer's own tasks (owner, co-owner or accountable) first; the rest grouped by their first owner role,
 * in role order, then tasks with no owner. Within a group, by position.
 * The site owner role is excluded from "mine" so the owner still sees tasks grouped by role.
 */
export function groupTasksForViewer<T extends RoleScopedTask>(
  tasks: readonly T[],
  viewerRoles: readonly Role[],
  roleOrder: readonly Role[],
): TaskGroup<T>[] {
  const ownRoles = viewerRoles.filter((r) => r !== 'owner');
  const byPosition = [...tasks].sort((a, b) => a.position - b.position);
  const mine = byPosition.filter((t) => canEditTask(ownRoles, t));
  const rest = byPosition.filter((t) => !canEditTask(ownRoles, t));
  const groups: TaskGroup<T>[] = mine.length > 0 ? [{ key: { kind: 'mine' }, tasks: mine }] : [];
  for (const role of roleOrder) {
    const inRole = rest.filter((t) => t.ownerRoles[0] === role);
    if (inRole.length > 0) groups.push({ key: { kind: 'role', role }, tasks: inRole });
  }
  const unassigned = rest.filter((t) => t.ownerRoles.length === 0);
  if (unassigned.length > 0) groups.push({ key: { kind: 'unassigned' }, tasks: unassigned });
  return groups;
}
