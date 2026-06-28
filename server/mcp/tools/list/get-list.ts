import { z } from 'zod';
import { objectToCamel } from 'ts-case-convert';
import { mcpSupabaseClient, mcpUserId } from '../../utils/auth';

export default defineMcpTool({
    name: 'get_list',
    description: 'Get a single list by ID along with its top-level todos',
    inputSchema: {
        id: z.string().describe('The list ID'),
    },
    handler: async ({ id }) => {
        const event = useEvent();
        await mcpUserId(event);
        const client = await mcpSupabaseClient(event);

        const { data: list, error: listError } = await client
            .from('Lists')
            .select('*')
            .eq('id', id)
            .single();

        if (listError || !list) {
            throw createError({ statusCode: 404, statusMessage: 'List not found' });
        }

        const { data: todos, error: todosError } = await client
            .from('Todos')
            .select('*')
            .eq('list_id', id)
            .order('order', { ascending: true });

        if (todosError) {
            throw createError({ statusCode: 500, statusMessage: todosError.message });
        }

        return { ...objectToCamel(list), todos: objectToCamel(todos ?? []) };
    },
});
