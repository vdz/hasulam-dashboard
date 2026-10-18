import { expect, test } from '@playwright/test';
import pg from 'pg';
import path from 'node:path';

const dbUrl = process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const evidenceDir = process.env.EVIDENCE_DIR ?? 'test-results/evidence';

async function taskStatus(id: string): Promise<string | undefined> {
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    const { rows } = await client.query<{ status: string }>('select status from public.tasks where id = $1', [id]);
    return rows[0]?.status;
  } finally {
    await client.end();
  }
}

test('a stakeholder signs in, sees only their tasks, and marks one done', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/signin/);
  await page.getByTestId('sign-in-email').fill('dev-kitchen@hasulam.test');
  await page.getByTestId('sign-in-password').fill('dev-password-kitchen');
  await page.getByTestId('sign-in-submit').click();

  await expect(page.getByTestId('my-tasks-title')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const items = page.getByTestId('task-item');
  await expect(items).toHaveCount(2);

  const first = items.first();
  const id = await first.getAttribute('data-task-id');
  if (id === null) throw new Error('task item has no id');
  await expect(first).toHaveAttribute('data-status', 'todo');
  expect(await taskStatus(id)).toBe('todo');

  await first.getByTestId('task-item-toggle').click();
  const toggled = page.locator(`[data-task-id="${id}"]`);
  await expect(toggled).toHaveAttribute('data-status', 'done');
  expect(await taskStatus(id)).toBe('done');
  await page.screenshot({ path: path.join(evidenceDir, 'my-tasks-390x844.png'), fullPage: true });

  await toggled.getByTestId('task-item-toggle').click();
  await expect(page.locator(`[data-task-id="${id}"]`)).toHaveAttribute('data-status', 'todo');
  expect(await taskStatus(id)).toBe('todo');
});
