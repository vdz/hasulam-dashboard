import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL, ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 }, locale: 'he-IL' },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npm run start', url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
