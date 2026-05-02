import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { objectToCamel } from 'ts-case-convert';

export default defineMcpTool({
    name: 'get_lists',
    description: 'Get all lists for the signed-in user',
    // enabled: event => event.context.sessions !== undefined,
    inputSchema: {},
    handler: async () => {
        const event = useEvent();
        const user = await serverSupabaseUser(event);
        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Not signed in' });
        }

        const client = await serverSupabaseClient(event);
        const { data, error } = await client
            .from('Lists')
            .select('name, id')
            .order('id', { ascending: true });

        if (error) {
            throw createError({ statusCode: 500, statusMessage: error.message });
        }

        return (data || []).map(list => objectToCamel(list));
    },
});
