import { defineConfig, devices } from '@playwright/test';

// The visual checks: the real components in Chromium, measured against spec/verify/. See
// test/visual/README.md.
export default defineConfig({
  testDir: 'test/visual',
  testMatch: '*.spec.mjs',
  globalSetup: './test/visual/build.mjs',
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
  projects: [{ name: 'chromium' }],
});
