import { objectToCamel } from 'ts-case-convert';
import { mcpSupabaseClient, mcpUserId } from '../utils/auth';

export default defineMcpTool({
    name: 'get_lists',
    description: 'Get all lists for the signed-in user',
    inputSchema: {},
    handler: async () => {
        const event = useEvent();
        await mcpUserId(event);

        const client = await mcpSupabaseClient(event);
        const { data, error } = await client
            .from('Lists')
            .select('name, id')
            .order('id', { ascending: true });

        if (error) {
            throw createError({ statusCode: 500, statusMessage: error.message });
        }

        return (data || []).map((list) => objectToCamel(list));
    },
});
