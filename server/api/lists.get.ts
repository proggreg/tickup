import { serverSupabaseClient } from '#supabase/server';

/**
 * Get all user lists with essential information only
 * Returns an array of lists containing only the name, ID, and icon for display purposes.
 * Other information like user metadata and timestamps is hidden from the tool.
 *
 * @returns {Array<{id: string, name: string, icon?: string}>} Array of lists with name and icon
 */
export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event);
        const { data, error } = await client.from('Lists').select('*');

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        // Transform snake_case fields to camelCase for API response
        return (data || []).map(list => ({
            ...list,
            userId: list.user_id,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
        }));
    }
    catch (error) {
        console.error('Error fetching lists:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch lists',
        });
    }
});
