import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

import 'dotenv/config';

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['test/unit/**/*.{test,spec}.ts'],
                    environment: 'node',
                },
            },
            {
                test: {
                    name: 'e2e',
                    include: ['test/e2e/*.{test,spec}.ts'],
                    environment: 'node',
                },
            },
            await defineVitestProject({
                test: {
                    name: 'nuxt',
                    include: ['test/nuxt/*.{test,spec}.ts'],
                    environment: 'nuxt',
                },
            }),
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary', 'html', 'json'],
            reportOnFailure: true,
            include: ['server/mcp/**/*.ts', 'server/api/**/*.ts'],
            exclude: ['node_modules/', 'test/', '**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
            reportsDirectory: '.coverage/vitest',
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 65,
                statements: 70,
            },
        },
    },
});
