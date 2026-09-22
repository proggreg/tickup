import { serverSupabaseClient } from '#supabase/server';
import { mapTodoToTask } from '~~/server/utils/tasks';

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event);

        const { data, error } = await supabase.from('Todos').select('*').is('parent_id', null);

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return (data || []).map(mapTodoToTask);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
});
