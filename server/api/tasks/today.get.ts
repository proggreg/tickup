import { serverSupabaseClient } from '#supabase/server';
import { mapTodoToTask } from '~~/server/utils/tasks';

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event);

        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const end = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
        );

        const { data, error } = await supabase
            .from('Todos')
            .select('*')
            .gte('due_date', start.toISOString())
            .lte('due_date', end.toISOString());

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return (data || []).map(mapTodoToTask);
    }
    catch (error) {
        console.error('Error fetching today\'s tasks:', error);
        return [];
    }
});
