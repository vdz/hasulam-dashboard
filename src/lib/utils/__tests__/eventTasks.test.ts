import { describe, expect, it } from 'vitest';
import type { Role } from '@/lib/db/enums';
import { canEditTask, groupTasksForViewer, type RoleScopedTask } from '../eventTasks';

const order: Role[] = ['operating_heads', 'kitchen', 'chef'];
const t = (position: number, ownerRoles: Role[], accountableRole: Role | null): RoleScopedTask => ({ position, ownerRoles, accountableRole });

const tasks = [t(3, ['chef'], 'kitchen'), t(1, ['operating_heads', 'kitchen'], 'operating_heads'), t(2, ['kitchen'], 'kitchen'), t(4, [], null), t(5, ['operating_heads'], 'operating_heads')];

describe('canEditTask', () => {
  it('allows owners, co-owners and the accountable role', () => {
    expect(canEditTask(['kitchen'], t(1, ['operating_heads', 'kitchen'], 'operating_heads'))).toBe(true);
    expect(canEditTask(['kitchen'], t(3, ['chef'], 'kitchen'))).toBe(true);
    expect(canEditTask(['owner'], t(4, [], null))).toBe(true);
  });
  it('refuses a higher role on a task below it', () => {
    expect(canEditTask(['operating_heads'], t(2, ['kitchen'], 'kitchen'))).toBe(false);
  });
});

describe('groupTasksForViewer', () => {
  it('puts the viewer’s own tasks first, then groups by role order, then unassigned', () => {
    const groups = groupTasksForViewer(tasks, ['operating_heads'], order);
    expect(groups.map((g) => g.key)).toEqual([{ kind: 'mine' }, { kind: 'role', role: 'kitchen' }, { kind: 'role', role: 'chef' }, { kind: 'unassigned' }]);
    expect(groups[0]?.tasks.map((x) => x.position)).toEqual([1, 5]);
  });
  it('does not lump everything into "mine" for the site owner', () => {
    const groups = groupTasksForViewer(tasks, ['owner'], order);
    expect(groups[0]?.key).toEqual({ kind: 'role', role: 'operating_heads' });
  });
});
