import { z } from 'zod';
import { tool } from 'ai';
import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';

export const searchTool = (event: H3Event) => tool({
    description: 'Search for a list or todo',
    inputSchema: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        console.log('search tool called ', query);
        const supabase = await serverSupabaseClient(event);
        const searchTerm = query.trim();
        const lists = await supabase.from('Lists').select().ilike('name', `%${searchTerm}%`);
        const todos = await supabase.from('Todos').select().ilike('name', `%${searchTerm}%`);

        return {
            lists,
            todos,
        };
    },
});
