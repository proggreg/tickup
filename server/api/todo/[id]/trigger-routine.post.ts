import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const todoId = event.context.params?.id;

    if (!todoId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    const body = await readBody(event);
    const claudeRoutineUrl = body?.claudeRoutineUrl;
    const claudeRoutineApiKey = body?.claudeRoutineApiKey;

    if (!claudeRoutineUrl) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Claude routine URL is required',
        });
    }

    if (!claudeRoutineApiKey) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Claude API key is required',
        });
    }

    try {
        const supabase = await serverSupabaseClient(event);

        // Fetch todo context to pass to the routine
        const { data: todo, error: todoError } = await supabase
            .from('Todos')
            .select('id, name, desc, status, due_date')
            .eq('id', todoId)
            .single();

        if (todoError || !todo) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Todo not found',
            });
        }

        await $fetch(claudeRoutineUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${claudeRoutineApiKey}`,
                'Content-Type': 'application/json',
            },
            body: {
                todoId,
                todo: {
                    id: todo.id,
                    name: todo.name,
                    description: todo.desc,
                    status: todo.status,
                    dueDate: todo.due_date,
                },
                timestamp: new Date().toISOString(),
            },
        });

        return {
            success: true,
            message: 'Routine triggered successfully',
            todoId,
            todoName: todo.name,
        };
    } catch (error: any) {
        console.error('Error triggering routine:', error);
        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage:
                error?.data?.statusMessage ||
                error?.data?.message ||
                error?.message ||
                'Failed to trigger routine',
        });
    }
});
