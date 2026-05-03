import { objectToSnake, objectToCamel } from 'ts-case-convert';
import { mcpSupabaseClient } from '~~/server/mcp/utils/auth';
import { TaskService } from '~~/server/utils/tasks';

export default defineEventHandler(async (event) => {
    const body = await readBody<Task>(event);
    const supabase = await mcpSupabaseClient(event);
    const todoData = objectToSnake(body)

    delete todoData.edit;
    delete todoData.user_id;
    delete todoData.subtasks;

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
        const todo = new TaskService(supabase)
        
        const { data, error } = await todo.create(todoData as unknown as Task)

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
