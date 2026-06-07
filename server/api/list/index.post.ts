import { serverSupabaseClient } from '#supabase/server';
import { broadcastToUser } from '../../routes/ws/lists';

export default defineEventHandler(async (event) => {
    const body = await readBody<List>(event);
    const supabase = await serverSupabaseClient(event);
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
        const result = (data as any[])[0] as Record<string, unknown>;
        if (result) {
            broadcastToUser(result.user_id as string, { type: 'list:created', payload: result });
            return {
                ...result,
                userId: result.user_id,
                createdAt: result.created_at,
                updatedAt: result.updated_at,
            };
        }

        return result;
    } catch (error) {
        console.error('Error creating list:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create list',
        });
    }
});
