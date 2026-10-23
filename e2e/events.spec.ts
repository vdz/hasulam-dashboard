import { expect, test, type Page } from '@playwright/test';
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

async function signIn(page: Page, who: string) {
  await page.goto('/signin?next=/events');
  await page.getByTestId('sign-in-email').fill(`dev-${who}@hasulam.test`);
  await page.getByTestId('sign-in-password').fill(`dev-password-${who}`);
  await page.getByTestId('sign-in-submit').click();
  await expect(page.getByTestId('event-list-title')).toBeVisible();
}

test('operating heads open an event: own tasks first and editable, roles below grouped and read-only', async ({ page }) => {
  await signIn(page, 'heads');
  await page.screenshot({ path: path.join(evidenceDir, 'events-list-390x844.png'), fullPage: true });
  await page.locator('[data-event-id="dev-feast-1"]').click();
  await expect(page.getByTestId('event-title')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const groups = page.getByTestId('task-group');
  await expect(groups.first()).toHaveAttribute('data-group', 'mine');
  const mine = groups.first().getByTestId('task-item');
  await expect(mine).toHaveCount(3); // feast 2, 8, 19
  await expect(page.locator('[data-group="kitchen"] [data-testid="task-item"]')).toHaveCount(2);
  await expect(page.locator('[data-group="kitchen"] [data-testid="task-item-toggle"]')).toHaveCount(0);
  await expect(page.locator('[data-group="kitchen"] [data-testid="task-item-read-only"]')).toHaveCount(2);
  await expect(page.locator('[data-group="rav_liaison"]')).toHaveCount(0);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(evidenceDir, 'event-heads-390x844.png'), fullPage: true });

  const first = mine.first();
  const id = await first.getAttribute('data-task-id');
  if (id === null) throw new Error('task item has no id');
  await first.getByTestId('task-item-toggle').click();
  await expect(page.locator(`[data-task-id="${id}"]`)).toHaveAttribute('data-status', 'done');
  expect(await taskStatus(id)).toBe('done');
  await page.locator(`[data-task-id="${id}"]`).getByTestId('task-item-toggle').click();
  await expect(page.locator(`[data-task-id="${id}"]`)).toHaveAttribute('data-status', 'todo');
  expect(await taskStatus(id)).toBe('todo');
});

test('a chef sees only their own tasks on the event page', async ({ page }) => {
  await signIn(page, 'chef');
  await page.locator('[data-event-id="dev-feast-1"]').click();
  await expect(page.getByTestId('task-group')).toHaveCount(1);
  await expect(page.locator('[data-group="mine"] [data-testid="task-item"]')).toHaveCount(2);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(evidenceDir, 'event-chef-390x844.png'), fullPage: true });
});

test('an unknown event id shows the not-found screen, not an error', async ({ page }) => {
  await signIn(page, 'kitchen');
  // Streamed (Suspense) pages commit a 200 before notFound() runs, so assert the UI rather than the status.
  await page.goto('/events/no-such-event');
  await expect(page.getByTestId('not-found')).toBeVisible();
});
