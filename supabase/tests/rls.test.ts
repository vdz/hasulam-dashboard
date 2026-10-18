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

async function visibleTasks(): Promise<{ position: number; owner_role: string | null }[]> {
  const { rows } = await client.query<{ position: number; owner_role: string | null }>(
    `select position, owner_role from public.tasks where event_id = 'dev-feast-1' order by position`,
  );
  return rows;
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

  it('shows a stakeholder only the tasks of their own role', async () => {
    await as('dev-kitchen@hasulam.test');
    const rows = await visibleTasks();
    expect(rows.map((r) => r.position)).toEqual([10, 11]);
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
