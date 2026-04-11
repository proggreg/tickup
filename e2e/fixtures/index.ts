import { test as base } from '@playwright/test';
import { ListAPI } from '../helpers/api/index';

type Fixtures = {
    listAPI: ListAPI;
};

export const test = base.extend<Fixtures>({
    baseURL: 'http://localhost:3000',
    listAPI: async ({ request }, use) => {
        await use(new ListAPI(request));
    },
});

export { expect } from '@playwright/test';
