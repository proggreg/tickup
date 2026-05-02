import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'search_todos',
    description: 'Search todos by name (case-insensitive substring match)',
    inputSchema: {
        query: z.string().describe('Search query'),
    },
    handler: async ({ query }) => {
        return await callApi('/api/search/todo', {
            method: 'POST',
            body: { query },
        });
    },
});
