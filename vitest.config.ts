import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

import 'dotenv/config';

export default defineConfig({
    test: {
        projects: [
            {
                esbuild: {
                    tsconfigRaw: {
                        compilerOptions: {
                            target: 'ESNext',
                            module: 'ESNext',
                            moduleResolution: 'Bundler',
                            strict: false,
                            skipLibCheck: true,
                        },
                    },
                },
                test: {
                    name: 'unit',
                    include: ['test/unit/*.{test,spec}.ts'],
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
    },
});
