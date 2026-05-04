import { mcpSupabaseClient } from '../../mcp/utils/auth';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    if (!event.context.params || !event.context.params._id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    const supabase = await mcpSupabaseClient(event);
    const todoId = parseInt(event.context.params._id, 10);
    const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .eq('id', todoId)
        .single();

    if (error) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Todo not found',
        });
    }

    // Transform snake_case fields back to camelCase for API response
    if (data) {
        return objectToCamel(data);
    }

    return data;
});
