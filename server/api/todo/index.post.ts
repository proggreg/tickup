import { serverSupabaseClient } from '#supabase/server';
import { objectToSnake, objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    const body = await readBody<Todo>(event);
    const supabase = await serverSupabaseClient(event);

    delete body.edit;
    delete body.userId;
    delete body.subtasks;

    if (body.parentId) {
        const { data: parent, error: parentError } = await supabase
            .from('Todos')
            .select('id')
            .eq('id', body.parentId)
            .single();
        if (parentError || !parent) {
            throw createError({ statusCode: 400, statusMessage: 'Parent todo not found' });
        }
        // Allow parent to be a subtask as well (nested subtasks are permitted)
    }

    const todo = objectToSnake(body);
    try {
        const { data, error } = await supabase.from('Todos').insert([todo]).select();

        if (error) {
            console.error('Supabase error:', error);
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        const result = data[0];
        if (result) {
            return objectToCamel(result);
        }
    }
    catch (e) {
        console.error('error', e);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create todo',
        });
    }
});
