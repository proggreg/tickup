import { createNewListState } from '../../../app/stores/helpers';
import type { List } from '../../../index';

export async function createList(request, payload: { name: string }) {
    const listPayload: List = { ...createNewListState(), ...payload };

    const listResponse = await request.post('/api/list', {
        data: listPayload,
    });

    return await listResponse.json();
}
