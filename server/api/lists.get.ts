import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event);
        const { data, error } = await client.from('Lists').select('id, name, icon');

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        return data || [];
    }
    catch (error) {
        console.error('Error fetching lists:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch lists',
        });
    }
});
