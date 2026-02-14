import { z } from 'zod';
import { tool } from 'ai';
import { serverSupabaseClient } from '#supabase/server';
import type { H3Event } from 'h3';

export const getListsTool = (event: H3Event) => tool({
    description: 'Get all lists',
    inputSchema: z.object({}),
    execute: async () => {
        console.log('get lists tool called');
        const client = await serverSupabaseClient(event);
        const { data, error } = await client.from('Lists').select('*');

        if (error) throw new Error(error.message);
        console.log('data', data);
        console.log('error', error);

        return {
            lists: (data || []).map(({ id, name, user_id, created_at, updated_at }) => ({
                id,
                name,
                userId: user_id,
                createdAt: created_at,
                updatedAt: updated_at,
            })),
        };
    },
});
