// vitest.global-setup.ts
import { spawn } from 'node:child_process';

let nuxtProcess: ReturnType<typeof spawn>;

export async function setup() {
    nuxtProcess = spawn('npx', ['nuxt', 'dev'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' },
    });

    // Wait for Nuxt to be ready
    await waitForServer('http://localhost:3000');
}

export async function teardown() {
    nuxtProcess?.kill();
}

function waitForServer(url: string, timeout = 30_000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(async () => {
            try {
                await fetch(url);
                clearInterval(interval);
                resolve();
            } catch {
                if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error(`Server at ${url} did not start within ${timeout}ms`));
                }
            }
        }, 500);
    });
}
