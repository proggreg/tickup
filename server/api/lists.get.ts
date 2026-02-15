import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event);
        const { data, error } = await client.from('Lists').select('id, name, icon, list_type, image, github_repo');

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        return (data || []).map(list => ({
            id: list.id,
            name: list.name,
            icon: list.icon,
            listType: list.list_type,
            image: list.image,
            githubRepo: list.github_repo,
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
