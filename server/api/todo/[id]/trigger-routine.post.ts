export default defineEventHandler(async (event) => {
    const todoId = event.context.params?.id;

    if (!todoId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Claude API key not configured',
        });
    }

    const triggerId = process.env.CLAUDE_TRIGGER_ID;
    if (!triggerId) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Claude trigger ID not configured',
        });
    }

    try {
        const response = await $fetch(`https://claude.ai/api/v1/code/triggers/${triggerId}/run`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: {
                todoId,
                timestamp: new Date().toISOString(),
            },
        });

        return {
            success: true,
            message: 'Routine triggered successfully',
            todoId,
            triggerId,
        };
    } catch (error: any) {
        console.error('Error triggering routine:', error);
        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage: error?.data?.message || error?.message || 'Failed to trigger routine',
        });
    }
});
