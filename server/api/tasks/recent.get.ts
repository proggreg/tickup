import { serverSupabaseClient } from '#supabase/server';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event);

        const { data, error } = await supabase
            .from('Todos')
            .select('*, Lists(id, name)')
            .is('parent_id', null)
            .order('updated_at', { ascending: false, nullsFirst: false })
            .limit(25);

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return (data || []).map(({ Lists, ...todo }) => ({
            ...objectToCamel(todo),
            list: Lists ? objectToCamel(Lists) : null,
        }));
    }
    catch (error) {
        console.error('Error fetching recent tasks:', error);
        return [];
    }
});
