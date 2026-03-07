import { serverSupabaseClient } from '#supabase/server';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    try {
        const { query } = await readBody(event);
        const supabase = await serverSupabaseClient(event);

        console.log('search query', query);

        // Use ilike for case-insensitive search in Supabase with snake_case fields
        const { data: todos, error } = await supabase
            .from('Todos')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('created_at', { ascending: false });

        const listIds = todos.filter(todo => todo.list_id).map(todo => todo.list_id);

        console.log('list ids', listIds);

        const { data: lists } = await supabase.from('Lists').select('*').in('id', listIds);

        todos.forEach((todo) => {
            if (!todo.list_id) return;
            const list = lists.find(list => list.id === todo.list_id);
            todo.list = list;
        });

        console.log('related lists', lists);

        if (error) {
            console.error('Search error:', error);
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        return objectToCamel(todos);
    }
    catch (error) {
        console.error('Todo search error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: `Search failed ${error.message}`,
        });
    }
});
