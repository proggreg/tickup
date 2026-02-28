import { serverSupabaseClient } from '#supabase/server';
import { objectToSnake, objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    delete body.subtasks;
    delete body.edit;

    if (!event.context.params || !event.context.params._id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }
    const todo = objectToSnake(body);

    const supabase = await serverSupabaseClient(event);

    const { data, error } = await supabase
        .from('Todos')
        .update(todo)
        .eq('id', event.context.params._id)
        .select()
        .single();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }

    if (data) {
        return objectToCamel(data);
    }
});
