import { defineConfig, devices } from '@playwright/test';

// Layout checks against the real components in a real browser. jsdom has no
// layout, so unit tests cannot see a popup land in the wrong place or a column
// collapse. The checks drive Storybook, which already renders every component.
export default defineConfig({
    testDir: 'e2e',
    // Not *.spec.ts: Vitest would pick that up.
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: { baseURL: 'http://localhost:6006' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'pnpm exec storybook dev -p 6006 --ci --no-open',
        url: 'http://localhost:6006',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
