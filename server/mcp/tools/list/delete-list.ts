import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'delete_list',
    description: 'Delete a list by ID',
    annotations: { destructiveHint: true },
    inputSchema: {
        id: z.string().describe('The list ID to delete'),
    },
    handler: async ({ id }) => {
        return await callApi(`/api/list/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
    },
});
