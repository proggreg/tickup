import { serverSupabaseClient } from '#supabase/server';
import { broadcastToUser } from '../../routes/ws/lists';

export default defineEventHandler(async (event) => {
    try {
        // Get the id from the URL path
        // console.log(event)
        const id = event.context.params?.id;

        console.log('Params:', event.context.params);
        console.log('ID:', id);
        console.log('URL:', event.node.req.url);

        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'List ID is required',
            });
        }

        const client = await serverSupabaseClient(event);
        const {
            data: { user },
        } = await client.auth.getUser();

        const listDeleted = await client.from('Lists').delete().eq('id', id);

        console.log('listDeleted', listDeleted);

        if (user?.id) {
            broadcastToUser(user.id, { type: 'list:deleted', payload: { id } });
        }

        return listDeleted;
    } catch (error) {
        console.error('Delete error:', error);
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
