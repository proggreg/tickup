import { test, expect, type APIRequestContext } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const createdIds: string[] = [];

async function postList(request: APIRequestContext, data: Record<string, unknown>) {
    const response = await request.post('/api/list', { data });
    if (response.ok()) {
        const list = await response.json();
        createdIds.push(list.id);
    }
    return response;
}

async function getList(request: APIRequestContext, id: string) {
    const response = await request.get(`/api/list/${id}`);
    expect(response.ok()).toBeTruthy();
    return response.json();
}

test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
        await request.delete(`/api/list/${id}`);
    }
});

test.describe('Lists — create from template', () => {
    test('shopping template presets name, icon and default view', async ({ request }) => {
        const response = await postList(request, { template: 'shopping' });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        expect(list).toMatchObject({
            name: 'Shopping',
            icon: 'mdi-cart',
            defaultView: 'list',
        });

        const fetched = await getList(request, list.id);
        expect(fetched).toMatchObject({
            name: 'Shopping',
            icon: 'mdi-cart',
            defaultView: 'list',
        });
    });

    test('explicit name overrides the template name', async ({ request }) => {
        const name = `Weekly shop ${uuidv4()}`;
        const response = await postList(request, { name, template: 'shopping' });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        expect(list.name).toEqual(name);
        expect(list.icon).toEqual('mdi-cart');
    });

    test('explicit icon overrides the template icon', async ({ request }) => {
        const response = await postList(request, { template: 'shopping', icon: 'mdi-basket' });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        expect(list.name).toEqual('Shopping');
        expect(list.icon).toEqual('mdi-basket');
    });

    test('icon without a template persists', async ({ request }) => {
        const name = `Icon list ${uuidv4()}`;
        const response = await postList(request, { name, icon: 'mdi-star' });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        const fetched = await getList(request, list.id);
        expect(fetched.icon).toEqual('mdi-star');
    });

    // Regression: an undefined defaultView was inserted as NULL, skipping the DB default.
    test('defaultView falls back to the DB default when not provided', async ({ request }) => {
        const response = await postList(request, { name: `No view ${uuidv4()}` });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        expect(list.defaultView).toEqual('list');
    });

    test('ignores unknown body fields such as todos', async ({ request }) => {
        const name = `Extra fields ${uuidv4()}`;
        const response = await postList(request, { name, todos: [], listType: 'simple' });
        expect(response.status()).toEqual(200);

        const list = await response.json();
        expect(list.name).toEqual(name);
    });

    test('returns 400 for an unknown template', async ({ request }) => {
        const response = await postList(request, { template: 'nope' });
        expect(response.status()).toEqual(400);
    });

    // Regression: the handler's catch used to rewrap this 400 as a 500.
    test('returns 400 when name is missing and no template is given', async ({ request }) => {
        const response = await postList(request, {});
        expect(response.status()).toEqual(400);
    });

    test('blank template still requires a name', async ({ request }) => {
        const response = await postList(request, { template: 'blank' });
        expect(response.status()).toEqual(400);
    });
});

test.describe('Lists — update icon', () => {
    test('PUT /api/list/:id updates the icon', async ({ request }) => {
        const createResponse = await postList(request, { name: `Update icon ${uuidv4()}` });
        const list = await createResponse.json();

        const updateResponse = await request.put(`/api/list/${list.id}`, {
            data: { id: list.id, icon: 'mdi-cart' },
        });
        expect(updateResponse.ok()).toBeTruthy();

        const fetched = await getList(request, list.id);
        expect(fetched.icon).toEqual('mdi-cart');
    });
});
