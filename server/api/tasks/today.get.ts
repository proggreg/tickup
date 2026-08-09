import { serverSupabaseClient } from '#supabase/server';
import { mapTodoToTask } from '~~/server/utils/tasks';

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event);

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            23,
            59,
            59,
            999,
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

        return data || [];
    } catch (error) {
        console.error("Error fetching today's tasks:", error);
        return [];
    }
});
