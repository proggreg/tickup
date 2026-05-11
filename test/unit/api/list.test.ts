import { describe, expect } from 'vitest';
import { apiTest } from '../fixtures/api';

describe('List API endpoints', () => {
    apiTest('should create a list via API', async ({ apiCall }) => {
        let listId: string | number | undefined;

        try {
            const res = await apiCall('/api/list', {
                method: 'POST',
                body: JSON.stringify({ name: 'Test List' }),
            });

            expect(res.ok).toBe(true);
            const list = await res.json();

            expect(list.id).toBeDefined();
            expect(list.name).toBe('Test List');
            listId = list.id;
        }
        finally {
            if (listId) {
                await apiCall(`/api/list/${listId}`, { method: 'DELETE' });
            }
        }
    });

    apiTest('should reject create with missing name', async ({ apiCall }) => {
        const res = await apiCall('/api/list', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        expect(res.ok).toBe(false);
        expect(res.status).toBe(400);
    });

    apiTest('should get a list by ID', async ({ apiCall }) => {
        const createRes = await apiCall('/api/list', {
            method: 'POST',
            body: JSON.stringify({ name: 'Get Test List' }),
        });
        const created = await createRes.json();

        try {
            const getRes = await apiCall(`/api/list/${created.id}`, { method: 'GET' });
            expect(getRes.ok).toBe(true);
            const fetched = await getRes.json();

            expect(fetched.id).toBe(created.id);
            expect(fetched.name).toBe('Get Test List');
            expect(Array.isArray(fetched.todos)).toBe(true);
        }
        finally {
            await apiCall(`/api/list/${created.id}`, { method: 'DELETE' });
        }
    });

    apiTest('should return 404 for non-existent list', async ({ apiCall }) => {
        const res = await apiCall('/api/list/999999999', { method: 'GET' });
        expect(res.status).toBe(404);
    });

    apiTest('should update a list name', async ({ apiCall }) => {
        const createRes = await apiCall('/api/list', {
            method: 'POST',
            body: JSON.stringify({ name: 'Original Name' }),
        });
        const created = await createRes.json();

        try {
            const updateRes = await apiCall(`/api/list/${created.id}`, {
                method: 'PUT',
                body: JSON.stringify({ id: created.id, name: 'Updated Name' }),
            });
            expect(updateRes.ok).toBe(true);

            const getRes = await apiCall(`/api/list/${created.id}`, { method: 'GET' });
            const fetched = await getRes.json();
            expect(fetched.name).toBe('Updated Name');
        }
        finally {
            await apiCall(`/api/list/${created.id}`, { method: 'DELETE' });
        }
    });

    apiTest('should delete a list', async ({ apiCall }) => {
        const createRes = await apiCall('/api/list', {
            method: 'POST',
            body: JSON.stringify({ name: 'Delete Me' }),
        });
        const created = await createRes.json();

        const deleteRes = await apiCall(`/api/list/${created.id}`, { method: 'DELETE' });
        expect(deleteRes.ok).toBe(true);

        const getRes = await apiCall(`/api/list/${created.id}`, { method: 'GET' });
        expect(getRes.status).toBe(404);
    });

    apiTest('should get all lists and include created list', async ({ apiCall }) => {
        const createRes = await apiCall('/api/list', {
            method: 'POST',
            body: JSON.stringify({ name: 'List For Get All' }),
        });
        const created = await createRes.json();

        try {
            const listsRes = await apiCall('/api/lists', { method: 'GET' });
            expect(listsRes.ok).toBe(true);
            const lists = await listsRes.json();

            expect(Array.isArray(lists)).toBe(true);
            const found = lists.find((l: Record<string, unknown>) => l.id === created.id);
            expect(found).toBeDefined();
            expect(found.name).toBe('List For Get All');
        }
        finally {
            await apiCall(`/api/list/${created.id}`, { method: 'DELETE' });
        }
    });
});
