import { test } from 'vitest';
import { createClient } from '@supabase/supabase-js';

interface APITestContext {
    apiCall: (path: string, options?: RequestInit) => Promise<Response>;
    createTodo: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    updateTodo: (
        id: string | number,
        data: Record<string, unknown>,
    ) => Promise<Record<string, unknown>>;
    deleteTodo: (id: string | number) => Promise<void>;
    getTodo: (id: string | number) => Promise<Record<string, unknown>>;
}

export const apiTest = test.extend<APITestContext>({
    async apiCall({}, use) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const adminKey = process.env.SUPABASE_SECRET_KEY;

        if (!supabaseUrl || !supabaseKey || !adminKey) {
            throw new Error('Missing required Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const adminSupabase = createClient(supabaseUrl, adminKey);

        const timestamp = Date.now();
        const testUserEmail = `test.api.${timestamp}@example.com`;
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

        const createdTodoIds: (string | number)[] = [];

        const apiCall = async (path: string, options?: RequestInit): Promise<Response> => {
            const url = new URL(path, 'http://localhost:3000');
            const headers = new Headers(options?.headers || {});
            headers.set('Authorization', `Bearer ${authToken}`);
            headers.set('Content-Type', 'application/json');

            const response = fetch(url.toString(), {
                ...options,
                headers,
            });

            // Track created todos
            if (options?.method === 'POST' && path === '/api/todo') {
                const res = await response;
                if (res.ok) {
                    const clone = res.clone();
                    const data = await clone.json();
                    if (data.id) {
                        createdTodoIds.push(data.id);
                    }
                }
                return res;
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

        // Cleanup user
        try {
            const { error } = await adminSupabase.auth.admin.deleteUser(testUserId);
            if (error) {
                console.warn('Failed to delete test user:', error.message);
            }
        } catch (err) {
            console.warn('Error deleting test user:', err);
        }
    },

    async createTodo({ apiCall }, use) {
        const createTodo = async (
            data: Record<string, unknown>,
        ): Promise<Record<string, unknown>> => {
            const response = await apiCall('/api/todo', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Create todo failed: ${response.statusText} - ${text}`);
            }

            return response.json();
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
