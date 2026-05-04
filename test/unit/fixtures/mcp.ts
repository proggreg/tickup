import { test } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createClient } from '@supabase/supabase-js';
import type { Task } from '../../../index';

interface MCPTestContext {
    client: Client;
}

interface User {
    email: string;
    password: string;
    authToken?: any;
}
interface UserContext {
    user: User;
}

interface APITestContext {
    apiCall: (path: string, options?: RequestInit) => Promise<Response>;
    createTodo: (data: Task) => Promise<Task>;
    updateTodo: (
        id: string | number,
        data: Record<string, unknown>,
    ) => Promise<Record<string, unknown>>;
    deleteTodo: (id: string | number) => Promise<void>;
    getTodo: (id: string | number) => Promise<Record<string, unknown>>;
}
export const mcpTest = test
    .extend<UserContext>({
        async user({}, use) {
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

            // Generate unique test user
            const uniqueId = crypto.randomUUID();
            const testUserEmail = `test.user.${uniqueId}@example.com`;
            const testPassword = 'TestPassword123!';

            // Sign up new test user
            const { data: signUpData, error: signUpError } =
                await adminSupabase.auth.admin.createUser({
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

            const user: User = {
                email: testUserEmail,
                password: testPassword,
            };

            // Sign in to get auth token
            const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword(user);

            if (signInError) {
                throw new Error(`Sign in failed: ${signInError.message}`);
            }

            const authToken = signInData.session?.access_token || '';
            if (!authToken) {
                throw new Error('No access token received');
            }

            user.authToken = authToken;

            use(user);

            // // Delete test user
            // try {
            //     const { error } = await adminSupabase.auth.admin.deleteUser(testUserId);
            //     if (error) {
            //         console.warn('Failed to delete test user:', error.message);
            //     }
            // } catch (err) {
            //     console.warn('Error deleting test user:', err);
            // }
        },
    })
    .extend<MCPTestContext>({
        async client({ user }, use) {
            // Load config from environment

            // Override globalThis.fetch to add Authorization header
            const originalFetch = globalThis.fetch;
            globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
                const headers = new Headers(init?.headers || {});
                headers.set('Authorization', `Bearer ${user.authToken}`);
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
        },
    })
    .extend<APITestContext>({
        async apiCall({ user }, use) {
            const createdTodoIds: (string | number)[] = [];

            const apiCall = async (path: string, options?: RequestInit): Promise<Response> => {
                // Sign in to get auth token
                const supabaseUrl = process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_KEY;
                const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (!supabaseUrl || !supabaseKey || !adminKey) {
                    throw new Error(
                        'Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY',
                    );
                }

                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data: signInData, error: signInError } =
                    await supabase.auth.signInWithPassword(user);

                if (signInError) {
                    throw new Error(`Sign in failed: ${signInError.message}`);
                }

                const token = signInData?.session?.access_token;
                if (!token) {
                    throw new Error('No access token from sign in');
                }

                const headers = new Headers(options?.headers || {});
                headers.set('Authorization', `Bearer ${token}`);
                if (!headers.has('Content-Type')) {
                    headers.set('Content-Type', 'application/json');
                }

                console.log('[apiCall] fetching:', `http://localhost:3000${path}`, 'method:', options?.method || 'GET');
                const response = await fetch(`http://localhost:3000${path}`, {
                    method: options?.method || 'GET',
                    headers,
                    body: options?.body,
                });
                console.log('[apiCall] response status:', response.status);

                // Track created todos
                if (options?.method === 'POST' && path === '/api/todo') {
                    if (response.ok) {
                        const clone = response.clone();
                        const data = await clone.json();
                        if (data.id) {
                            createdTodoIds.push(data.id);
                        }
                    }
                }

                return response;
            };

            await use(apiCall);

            // Cleanup todos
            for (const todoId of createdTodoIds) {
                try {
                    const response = await apiCall(`/api/todo/${todoId}`, { method: 'DELETE' });
                    if (!response.ok && response.status !== 404) {
                        console.warn('Failed to delete test todo:', response.statusText);
                    }
                } catch (err) {
                    console.warn('Failed to delete test todo:', err);
                }
            }
        },

        async createTodo({ apiCall }, use) {
            const createTodo = async (data: Task): Promise<Task> => {
                const response = await apiCall('/api/todo', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Create todo failed: ${response.statusText} - ${text}`);
                }

                const todo = await response.json();

                return todo;
            };

            await use(createTodo);
        },

        async updateTodo({ apiCall }, use) {
            const updateTodo = async (
                id: string | number,
                data: Record<string, unknown>,
            ): Promise<Record<string, unknown>> => {
                const response = await apiCall(`/api/todo/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`Update todo failed: ${response.statusText}`);
                }

                return response.json();
            };

            await use(updateTodo);
        },

        async deleteTodo({ apiCall }, use) {
            const deleteTodo = async (id: string | number): Promise<void> => {
                const response = await apiCall(`/api/todo/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Delete todo failed: ${response.statusText}`);
                }
            };

            await use(deleteTodo);
        },

        async getTodo({ apiCall }, use) {
            const getTodo = async (id: string | number): Promise<Record<string, unknown>> => {
                const response = await apiCall(`/api/todo/${id}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Get todo failed: ${response.statusText}`);
                }

                return response.json();
            };

            await use(getTodo);
        },
    });
