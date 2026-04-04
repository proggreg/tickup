import type { List } from '../../index';
import type { APIRequestContext } from '@playwright/test';
import { APIRoutes as api } from './routes';

export async function createList(request: APIRequestContext, data: Partial<List>): Promise<List | undefined> {
    const response = await request.post(api.list.post, { data });

    if (!response.ok) {
        throw Error(response.statusText());
    }
    const list = await response.json();

    return list;
}
