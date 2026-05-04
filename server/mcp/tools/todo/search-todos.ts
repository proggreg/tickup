import { z } from 'zod';
import { objectToCamel } from 'ts-case-convert';
import { mcpSupabaseClient, mcpUserId } from '../../utils/auth';

export default defineMcpTool({
    name: 'search_todos',
    description: 'Search todos by name (case-insensitive substring match)',
    inputSchema: {
        query: z.string().describe('Search query'),
    },
    handler: async ({ query }) => {
        const event = useEvent();
        await mcpUserId(event);
        const supabase = await mcpSupabaseClient(event);

        const { data: todos, error } = await supabase
            .from('Todos')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            return [
                {
                    isError: true,
                    message: error.message,
                }
            ];
        }

        const listIds = todos.filter((todo: any) => todo.list_id).map((todo: any) => todo.list_id);

        if (listIds.length > 0) {
            const { data: lists } = await supabase.from('Lists').select('*').in('id', listIds);

            todos.forEach((todo: any) => {
                if (!todo.list_id || !lists) return;
                const list = lists.find((l: any) => l.id === todo.list_id);
                todo.list = list;
            });
        }

        return (todos || []).map((todo: any) => objectToCamel(todo));
    },
});
