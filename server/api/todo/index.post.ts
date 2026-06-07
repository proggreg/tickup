import { objectToSnake, objectToCamel } from 'ts-case-convert';
import { TaskService } from '~~/server/utils/tasks';
import { broadcastToUser } from '../../routes/ws/lists';

export default defineEventHandler(async (event) => {
    const body = await readBody<Task>(event);
    const supabase = event.context.supabase;
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user?.id) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    const todoData = objectToSnake(body) as any;

    console.log('create todo');

    delete todoData.edit;
    delete todoData.subtasks;

    // Always use authenticated user's ID
    todoData.user_id = user.id;

    if (body.parentId) {
        const { data: parent, error: parentError } = await supabase
            .from('Todos')
            .select('id')
            .eq('id', todoData.parent_id)
            .single();
        if (parentError || !parent) {
            throw createError({ statusCode: 400, statusMessage: 'Parent todo not found' });
        }
        // Allow parent to be a subtask as well (nested subtasks are permitted)
    }

    try {
        const todo = new TaskService(supabase);

        const { data, error } = await todo.create(todoData as unknown as Task);

        if (error) {
            console.error('Supabase error:', error);
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        const result = data[0];
        if (result) {
            console.log('todo created', result.id);
            broadcastToUser(result.user_id, {
                type: 'todo:created',
                payload: objectToCamel(result) as Record<string, unknown>,
            });
            return objectToCamel(result);
        }
    } catch (e) {
        console.error('error', e);
        throw createError({
            statusCode: 500,
            statusMessage: (e as Error).message ?? 'Internal server error',
        });
    }
});
