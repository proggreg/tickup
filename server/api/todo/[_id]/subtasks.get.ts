import { mcpSupabaseClient } from '../../../mcp/utils/auth';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    if (!event.context.params?._id) {
        throw createError({ statusCode: 400, statusMessage: 'Todo ID is required' });
    }
    const parentId = parseInt(event.context.params._id, 10);
    const supabase = await mcpSupabaseClient(event);
    const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });
    if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    return (data || []).map((todo) => objectToCamel(todo));
});
