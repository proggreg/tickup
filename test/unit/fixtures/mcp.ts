import { test } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

interface MCPTestContext {
    client: Client;
    userId: string;
    createTodo: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteTodo: (id: string | number) => Promise<void>;
}

function buildSupabaseCookieHeader(supabaseUrl: string, session: Session): string {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;
    const sessionJson = JSON.stringify(session);
    // base64url encoding (URL-safe, no padding) — matches @supabase/ssr stringToBase64URL
    const base64url = Buffer.from(sessionJson, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return `${cookieName}=base64-${base64url}`;
}

export const mcpTest = test.extend<MCPTestContext>({
    async client({}, use) {
        // Load config from environment
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey || !adminKey) {
            throw new Error(
                'Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY',
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const adminSupabase = createClient(supabaseUrl, adminKey);

        const testUserEmail = `test.user.${crypto.randomUUID()}@example.com`;
        const testPassword = 'TestPassword123!';

        const { data: signUpData, error: signUpError } = await adminSupabase.auth.admin.createUser({
            email: testUserEmail,
            password: testPassword,
            email_confirm: true,
        });

        if (signUpError) {
            throw new Error(`Sign up failed: ${signUpError.message}`);
        }

        const testUserId = signUpData.user?.id || '';
        if (!testUserId) {
            throw new Error('No user ID received from signup');
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testUserEmail,
            password: testPassword,
        });

        if (signInError) {
            throw new Error(`Sign in failed: ${signInError.message}`);
        }

        const authToken = signInData.session?.access_token || '';
        if (!authToken) {
            throw new Error('No access token received');
        }

        const sessionCookie = buildSupabaseCookieHeader(supabaseUrl, signInData.session!);

        // Override globalThis.fetch to add Authorization header and Supabase session cookie.
        // The cookie is needed because callApi() forwards cookies to internal Nuxt API routes,
        // which use serverSupabaseClient() (cookie-based auth).
        // Must restore in finally — if client.connect throws, the override would leak into
        // subsequent tests and corrupt their admin API calls with a user-scoped token.
        const originalFetch = globalThis.fetch;
        globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers || {});
            headers.set('Authorization', `Bearer ${authToken}`);
            headers.set('Cookie', sessionCookie);
            return originalFetch(input, { ...init, headers });
        }) as typeof globalThis.fetch;

        const url = new URL('http://localhost:3000/mcp');
        const transport = new StreamableHTTPClientTransport(url);

        const client = new Client({
            name: 'test-client',
            version: '1.0.0',
        });

        try {
            await client.connect(transport);
            await use(client);
            await client.close();
            await transport.close();
        } finally {
            globalThis.fetch = originalFetch;
        }

        try {
            const { error } = await adminSupabase.auth.admin.deleteUser(testUserId);
            if (error) {
                console.warn('Failed to delete test user:', error.message);
            }
        } catch (err) {
            console.warn('Error deleting test user:', err);
        }
    },

    async userId({}, use) {
        await use('');
    },

    async createTodo({ client: _ }, use) {
        const createdIds: (string | number)[] = [];

        const createTodo = async (
            data: Record<string, unknown>,
        ): Promise<Record<string, unknown>> => {
            const resp = await fetch('http://localhost:3000/api/todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!resp.ok) throw new Error(`Create todo failed: ${resp.statusText}`);
            const todo = (await resp.json()) as Record<string, unknown>;
            createdIds.push(todo.id as string | number);
            return todo;
        };

        await use(createTodo);

        for (const id of createdIds) {
            await fetch(`http://localhost:3000/api/todo/${id}`, { method: 'DELETE' }).catch(
                () => {},
            );
        }
    },

    async deleteTodo({ client: _ }, use) {
        const deleteTodo = async (id: string | number): Promise<void> => {
            const resp = await fetch(`http://localhost:3000/api/todo/${id}`, { method: 'DELETE' });
            if (!resp.ok && resp.status !== 404) {
                console.warn(`Delete todo ${id} failed: ${resp.statusText}`);
            }
        };
        await use(deleteTodo);
    },
});
