import { test } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createClient } from '@supabase/supabase-js';

interface MCPTestContext {
    client: Client;
}

export const mcpTest = test.extend<MCPTestContext>({
    async client({}, use) {
        // Load config from environment
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const adminKey = process.env.SUPABASE_SECRET_KEY;

        if (!supabaseUrl || !supabaseKey || !adminKey) {
            throw new Error('Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SECRET_KEY');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const adminSupabase = createClient(supabaseUrl, adminKey);

        // Generate unique test user
        const timestamp = Date.now();
        const testUserEmail = `test.user.${timestamp}@example.com`;
        const testPassword = 'TestPassword123!';

        // Sign up new test user
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

        // Sign in to get auth token
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

        // Override globalThis.fetch to add Authorization header
        const originalFetch = globalThis.fetch;
        globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers || {});
            headers.set('Authorization', `Bearer ${authToken}`);
            return originalFetch(input, { ...init, headers });
        }) as typeof globalThis.fetch;

        // Create HTTP transport pointing to Nuxt MCP server
        const url = new URL('http://localhost:3000/mcp');
        const transport = new StreamableHTTPClientTransport(url);

        // Initialize MCP client
        const client = new Client({
            name: 'test-client',
            version: '1.0.0',
        });

        // Connect client to transport
        await client.connect(transport);

        // Provide context to test
        await use(client);

        // Teardown
        await client.close();
        await transport.close();
        globalThis.fetch = originalFetch;

        // Delete test user
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
