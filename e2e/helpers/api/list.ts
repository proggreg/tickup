import { expect, type APIRequestContext } from '@playwright/test';

import { APIRoutes } from '../routes';

export class ListAPI {
    private request;

    constructor(request: APIRequestContext) {
        this.request = request;
    };

    async new(data: List) {
        const response = await this.request.post(APIRoutes.list.post, { data });
        expect(response.ok()).toBeTruthy();
        return response.json() as Promise<List>;
    }
}
