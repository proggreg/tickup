import { test } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createClient } from '@supabase/supabase-js';

interface AuthContext {
    token: string;
    userId: string;
}

interface MCPTestContext {
    client: Client;
    userId: string;
    createTodo: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteTodo: (id: string | number) => Promise<void>;
}

const authTest = test.extend<{ authContext: AuthContext }>({
    async authContext({}, use) {
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

        await use({ token: authToken, userId: testUserId });

        try {
            const { error } = await adminSupabase.auth.admin.deleteUser(testUserId);
            if (error) {
                console.warn('Failed to delete test user:', error.message);
            }
        } catch (err) {
            console.warn('Error deleting test user:', err);
        }
    },
});

export const mcpTest = authTest.extend<MCPTestContext>({
    async client({ authContext }, use) {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers || {});
            headers.set('Authorization', `Bearer ${authContext.token}`);
            return originalFetch(input, { ...init, headers });
        }) as typeof globalThis.fetch;

        const url = new URL('http://localhost:3000/mcp');
        const transport = new StreamableHTTPClientTransport(url);

        const client = new Client({
            name: 'test-client',
            version: '1.0.0',
        });

        await client.connect(transport);

        await use(client);

        await client.close();
        await transport.close();
        globalThis.fetch = originalFetch;
    },

    async userId({ authContext }, use) {
        await use(authContext.userId);
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
