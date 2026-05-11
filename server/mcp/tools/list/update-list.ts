import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'update_list',
    description: 'Update a list (name, github repo, list type, default view)',
    inputSchema: {
        id: z.string().describe('The list ID'),
        name: z.string().optional().describe('New list name'),
        githubRepo: z.string().optional().describe('Linked GitHub repo full name (owner/repo)'),
        listType: z.string().optional().describe('List type'),
        defaultView: z.string().optional().describe('Default view for the list'),
    },
    handler: async (args) => {
        return await callApi(`/api/list/${encodeURIComponent(args.id)}`, {
            method: 'PUT',
            body: args,
        });
    },
});
