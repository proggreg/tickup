import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const body = await readBody<List>(event);
    const supabase = await serverSupabaseClient(event);
    try {
        const listData: any = {
            name: body.name,
        };

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
    catch (error) {
        console.error('Error creating list:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create list',
        });
    }
});
