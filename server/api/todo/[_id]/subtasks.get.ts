import { serverSupabaseClient } from '#supabase/server';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    if (!event.context.params?._id) {
        throw createError({ statusCode: 400, statusMessage: 'Todo ID is required' });
    }
    const supabase = await serverSupabaseClient(event);
    const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .eq('parent_id', event.context.params._id)
        .order('created_at', { ascending: true });
    if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    return (data || []).map(todo => objectToCamel(todo));
});
