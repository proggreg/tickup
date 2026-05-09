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
    const claudeRoutineId = body?.claudeRoutineId;
    const claudeRoutineApiKey = body?.claudeRoutineApiKey;

    if (!claudeRoutineId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Claude routine ID is required',
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

        // Build context text for the routine
        const contextText = `Task to process:
Title: ${todo.name}
Description: ${todo.desc || '(no description)'}
Status: ${todo.status || 'Open'}
Due Date: ${todo.due_date || '(no due date)'}
ID: ${todo.id}`;

        await $fetch(`https://api.anthropic.com/v1/claude_code/routines/${claudeRoutineId}/fire`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${claudeRoutineApiKey}`,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'experimental-cc-routine-2026-04-01',
                'Content-Type': 'application/json',
            },
            body: {
                text: contextText,
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
