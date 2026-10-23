import { expect, test } from '@playwright/test';
import path from 'node:path';

const evidenceDir = process.env.EVIDENCE_DIR ?? 'test-results/evidence';

test('the sign-in page offers a single Google button that starts Supabase Google OAuth', async ({ page }) => {
  const seen: URL[] = [];
  await page.route('**/auth/v1/authorize**', async (route) => {
    seen.push(new URL(route.request().url()));
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>google</p>' });
  });
  await page.goto('/signin');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByTestId('sign-in-google')).toBeVisible();
  await expect(page.getByTestId('sign-in-google')).toHaveCount(1);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(evidenceDir, 'sign-in-390x844.png'), fullPage: true });

  await page.getByTestId('sign-in-google').click();
  await expect.poll(() => seen.length).toBe(1);
  const params = seen[0]?.searchParams;
  expect(params?.get('provider')).toBe('google');
  expect(new URL(params?.get('redirect_to') ?? 'x:').pathname).toBe('/auth/callback');
  expect(params?.get('code_challenge_method')).toBe('s256');
});

test('the OAuth callback without a valid code goes back to sign-in with an error', async ({ page }) => {
  await page.goto('/auth/callback?code=bogus&next=//evil.example');
  await expect(page).toHaveURL(/\/signin\?failed=1/);
  await expect(page.getByTestId('sign-in-notice')).toBeVisible();
});

test('a signed-in Google account that is not a member sees a polite screen and no data', async ({ page }) => {
  await page.goto('/signin');
  await page.getByTestId('sign-in-email').fill('dev-outsider@hasulam.test');
  await page.getByTestId('sign-in-password').fill('dev-password-outsider');
  await page.getByTestId('sign-in-submit').click();
  await expect(page).toHaveURL(/\/not-a-member/);
  await expect(page.getByTestId('not-member-email')).toHaveText('dev-outsider@hasulam.test');
  await page.screenshot({ path: path.join(evidenceDir, 'not-member-390x844.png'), fullPage: true });

  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/not-a-member/);
  await expect(page.getByTestId('task-item')).toHaveCount(0);

  await page.getByTestId('not-member-sign-out').click();
  await expect(page).toHaveURL(/\/signin/);
});
