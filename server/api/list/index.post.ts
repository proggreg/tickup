export default defineEventHandler(async (event) => {
    const body = await readBody<List>(event);
    const supabase = event.context.supabase;
    try {
        const listData: any = {
            name: body.name,
        };

        if (!listData.name) {
            throw createError({
                statusCode: 400,
                statusText: 'List name is required',
            });
        }

        const { data, error } = await supabase.from('Lists').insert([listData]).select();

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        // Transform snake_case fields to camelCase for API response
        const result = data[0];
        if (result) {
            return {
                ...result,
                userId: result.user_id,
                createdAt: result.created_at,
                updatedAt: result.updated_at,
            };
        }

        return result;
    }
    catch (error: any) {
        if (error.statusCode) throw error;
        console.error('Error creating list:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create list',
        });
    }
});
