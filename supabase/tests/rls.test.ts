import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });

beforeAll(() => client.connect());
afterAll(() => client.end());
beforeEach(() => client.query('begin'));
afterEach(() => client.query('rollback'));

async function as(email: string | null) {
  if (email === null) {
    await client.query('set local role anon');
    return;
  }
  await client.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ role: 'authenticated', email })]);
  await client.query('set local role authenticated');
}

async function visibleTasks(): Promise<{ position: number }[]> {
  const { rows } = await client.query<{ position: number }>(
    `select position from public.tasks where event_id = 'dev-feast-1' order by position`,
  );
  return rows;
}

async function personId(email: string): Promise<string> {
  const { rows } = await client.query<{ id: string }>(`select id from public.people where email = $1`, [email]);
  const id = rows[0]?.id;
  if (id === undefined) throw new Error(`no person ${email}`);
  return id;
}

async function markDone(position: number, email: string): Promise<number | null> {
  const id = await taskId(position);
  const me = await personId(email);
  await as(email);
  const { rowCount } = await client.query(`update public.tasks set status = 'done', updated_by = $2 where id = $1`, [id, me]);
  return rowCount;
}

async function taskId(position: number): Promise<string> {
  const { rows } = await client.query<{ id: string }>(
    `select id from public.tasks where event_id = 'dev-feast-1' and position = $1`,
    [position],
  );
  const id = rows[0]?.id;
  if (id === undefined) throw new Error(`no seeded task at position ${String(position)}`);
  return id;
}

describe('task visibility', () => {
  it('shows the owner every task of the event', async () => {
    await as('dev-owner@hasulam.test');
    expect(await visibleTasks()).toHaveLength(19);
  });

  it('shows a leaf role only the tasks it owns', async () => {
    await as('dev-chef@hasulam.test');
    expect((await visibleTasks()).map((r) => r.position)).toEqual([13, 15]);
  });

  it('shows a department head its own tasks plus every task of the roles below it', async () => {
    await as('dev-kitchen@hasulam.test');
    // own: 2, 19 (co-owner), 10, 11; below (chef, buyer, women_team, men_team): 12, 13, 15, 16, 18
    expect((await visibleTasks()).map((r) => r.position)).toEqual([2, 10, 11, 12, 13, 15, 16, 18, 19]);
  });

  it('lets visibility cascade more than one level down', async () => {
    await as('dev-heads@hasulam.test');
    const positions = (await visibleTasks()).map((r) => r.position);
    expect(positions).toEqual(expect.arrayContaining([2, 4, 5, 8, 10, 15, 18, 19]));
    expect(positions).not.toContain(1); // rav_liaison reports to the owner, not to the operating heads
  });

  it('shows nothing to a signed-in user who is not a known person', async () => {
    await as('dev-outsider@hasulam.test');
    expect(await visibleTasks()).toHaveLength(0);
  });

  it('shows nothing to anonymous visitors', async () => {
    await as(null);
    await expect(visibleTasks()).rejects.toThrow(/permission denied/);
  });
});

describe('role hierarchy: see below, edit only your own', () => {
  it('lets a higher role see but not edit a task of a role below it', async () => {
    expect(await markDone(10, 'dev-heads@hasulam.test')).toBe(0);
  });

  it('lets the accountable department head edit a task owned by a role below it', async () => {
    expect(await markDone(15, 'dev-kitchen@hasulam.test')).toBe(1);
  });

  it('lets every co-owner edit a shared task', async () => {
    expect(await markDone(2, 'dev-kitchen@hasulam.test')).toBe(1);
    expect(await markDone(19, 'dev-heads@hasulam.test')).toBe(1);
  });

  it('does not let a lower role see or edit its parent’s tasks', async () => {
    expect(await markDone(10, 'dev-chef@hasulam.test')).toBe(0);
  });

  it('shows the hierarchy to members only and does not let them change it', async () => {
    await as('dev-kitchen@hasulam.test');
    const { rows } = await client.query<{ parent_role: string | null }>(`select parent_role from public.role_hierarchy where role = 'chef'`);
    expect(rows[0]?.parent_role).toBe('kitchen');
    await expect(client.query(`update public.role_hierarchy set parent_role = 'owner' where role = 'chef'`)).rejects.toThrow(/permission denied/);
  });

  it('hides the hierarchy from non-members and anonymous visitors', async () => {
    await as(null);
    await expect(client.query(`select 1 from public.role_hierarchy`)).rejects.toThrow(/permission denied/);
  });

  it('returns no hierarchy rows to a signed-in non-member', async () => {
    await as('dev-outsider@hasulam.test');
    expect((await client.query(`select 1 from public.role_hierarchy`)).rowCount).toBe(0);
  });

  it('requires an accountable role whenever a task has owners', async () => {
    await expect(
      client.query(`update public.tasks set accountable_role = null where event_id = 'dev-feast-1' and position = 10`),
    ).rejects.toThrow(/tasks_accountable_set/);
  });
});

describe('marking tasks', () => {
  it('lets a stakeholder mark their own task done', async () => {
    const id = await taskId(10);
    await as('dev-kitchen@hasulam.test');
    const { rowCount } = await client.query(
      `update public.tasks set status = 'done', updated_by = (select id from public.people where email = 'dev-kitchen@hasulam.test') where id = $1`,
      [id],
    );
    expect(rowCount).toBe(1);
  });

  it('silently ignores a stakeholder updating another role’s task', async () => {
    const id = await taskId(8);
    await as('dev-kitchen@hasulam.test');
    const { rowCount } = await client.query(`update public.tasks set status = 'done' where id = $1`, [id]);
    expect(rowCount).toBe(0);
  });

  it('refuses to let a stakeholder rename a task', async () => {
    const id = await taskId(10);
    await as('dev-kitchen@hasulam.test');
    await expect(client.query(`update public.tasks set title = 'x' where id = $1`, [id])).rejects.toThrow(/permission denied/);
  });

  it('refuses to record someone else as the updater', async () => {
    const id = await taskId(10);
    const { rows } = await client.query<{ id: string }>(`select id from public.people where email = 'dev-owner@hasulam.test'`);
    await as('dev-kitchen@hasulam.test');
    await expect(
      client.query(`update public.tasks set status = 'done', updated_by = $2 where id = $1`, [id, rows[0]?.id]),
    ).rejects.toThrow(/row-level security/);
  });
});

describe('drafts and CTA requests', () => {
  it('hides drafts from stakeholders and blocks them from writing drafts', async () => {
    await as('dev-kitchen@hasulam.test');
    await expect(
      client.query(`insert into public.drafts (recipient, body) values ('x', 'y')`),
    ).rejects.toThrow(/permission denied/);
  });

  it('lets a member queue a CTA request only in their own name', async () => {
    const { rows } = await client.query<{ id: string }>(`select id from public.people where email = 'dev-owner@hasulam.test'`);
    await as('dev-kitchen@hasulam.test');
    await expect(
      client.query(
        `insert into public.cta_requests (event_id, cta, requested_by, idempotency_key) values ('dev-feast-1', 'request_headcount', $1, 'k1')`,
        [rows[0]?.id],
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it('lets the calendar_keeper role write request status', async () => {
    const { rows } = await client.query<{ id: string }>(
      `insert into public.cta_requests (event_id, cta, requested_by, idempotency_key)
       select 'dev-feast-1', 'request_headcount', id, 'k2' from public.people where email = 'dev-owner@hasulam.test' returning id`,
    );
    await client.query('set local role calendar_keeper');
    const { rowCount } = await client.query(`update public.cta_requests set status = 'drafted' where id = $1`, [rows[0]?.id]);
    expect(rowCount).toBe(1);
  });

  it('only allows approved or sent drafts that name an approver', async () => {
    await expect(
      client.query(`insert into public.drafts (recipient, body, status) values ('x', 'y', 'sent')`),
    ).rejects.toThrow(/check constraint/);
  });
});
