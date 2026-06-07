import { serverSupabaseClient } from '#supabase/server';
import { broadcastToUser } from '../../routes/ws/lists';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<List>(event);
        const client = await serverSupabaseClient(event);
        const { data, error } = await client
            .from('Lists')
            .update({
                name: body.name,
                github_repo: body.githubRepo,
                list_type: body.listType,
                default_view: body.defaultView,
            })
            .eq('id', body.id)
            .select();
        if (!error && data) {
            const row = (data as any[])[0] as Record<string, unknown> | undefined;
            if (row?.user_id) {
                broadcastToUser(row.user_id as string, { type: 'list:updated', payload: row });
            }
        }
        return { data, error };
    } catch (error) {
        return error;
    }
});
