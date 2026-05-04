import { objectToSnake, objectToCamel } from 'ts-case-convert';
import { mcpSupabaseClient } from '../../mcp/utils/auth';

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

    console.log('update todo id: ', event.context.params._id)
    
    // Remove undefined fields to avoid Supabase issues
    const cleanBody = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;

    const todo = objectToSnake(cleanBody) as Record<string, unknown>;

    console.log('update todo parent_id: ', todo.parent_id)
    const todoId = parseInt(event.context.params._id, 10);

    const supabase = await mcpSupabaseClient(event);

    const { data, error } = await supabase
        .from('Todos')
        .update(todo as any)
        .eq('id', todoId)
        .select() as { data: unknown[] | null; error: unknown };

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: (error as Record<string, unknown>).message as string,
        });
    }

    if (data && data.length > 0) {
        return objectToCamel(data[0] as Record<string, unknown>);
    }

    throw createError({
        statusCode: 404,
        statusMessage: 'Todo not found',
    });
});
