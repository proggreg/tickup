import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',

    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Global setup and teardown */
    // globalSetup: './e2e/setup-user-journey.ts',
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Record video for all tests */
        video: 'on',

        /* Take screenshot on failure */
        screenshot: 'only-on-failure',

        headless: true,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'setup',
            testMatch: /global\.setup\.ts/,
        },
        {
            name: 'cleanup',
            testMatch: /global\.teardown\.ts/,
        },

        // All other projects depend on the setup project
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'user.json',
            },
            dependencies: ['setup'],
        },

        {
            name: 'pixel_7',
            use: {
                ...devices['Pixel 7'],
                storageState: 'user.json',
            },
            dependencies: ['setup'],
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'NODE_ENV=test pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 120 seconds to allow for longer startup times
        stdout: 'pipe', // Pipe the stdout to see server logs
        stderr: 'pipe', // Pipe the stderr to see error logs
    },
});
