import { z } from 'zod';
import { tool } from 'ai';
import type { H3Event } from 'h3';
import { getList } from '../../list/[id].get';

export const getListTool = (event: H3Event) => tool({
    description: 'Get a list',
    inputSchema: z.object({
        listName: z.string(),
    }),
    execute: async ({ listName }) => {
        console.log('get list tool called');
        const list = await getList(event, { name: listName });

        return {
            list,
        };
    },
});
