import { serverSupabaseClient } from '#supabase/server';
import { mapTodoToTask } from '~~/server/utils/tasks';

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event);

        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const { data, error } = await supabase
            .from('Todos')
            .select('*')
            .lt('due_date', start.toISOString())
            .is('parent_id', null)
            .order('due_date', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return (data || []).map(mapTodoToTask);
    }
    catch (error) {
        console.error('Error fetching overdue tasks:', error);
        return [];
    }
});
