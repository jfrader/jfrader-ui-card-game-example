import { defineConfig, devices } from '@playwright/test';

// Not Vite's preview default (4173), which other local projects often hold.
const port = 4319;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    // A server already on the port may be another app; fail instead of testing it.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_AI_DELAY_MS: '30' },
  },
});
