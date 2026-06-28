import { createNewListState } from '../../../app/stores/helpers';
import type { List } from '../../../index';
import type { APIRequestContext } from '@playwright/test';

export async function createList(request: APIRequestContext, payload: { name: string }) {
    const listPayload: List = { ...createNewListState(), ...payload };

    const listResponse = await request.post('/api/list', {
        data: listPayload,
    });

    return await listResponse.json();
}
