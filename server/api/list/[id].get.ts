import { serverSupabaseClient } from '#supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    try {
        const { id } = event.context.params;

        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'List ID is required',
            });
        }

        return await getList(event, { id });
    }
    catch (error: any) {
    // If it's already a createError, re-throw it
        if (error.statusCode) {
            throw error;
        }

        console.error('List API error:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch list',
        });
    }
});

interface GetListParam { id?: string; name?: string };

export async function getList(event, params: GetListParam) {
    const supabase = await serverSupabaseClient(event);

    // Get the list
    const { id, name } = params;

    const { data: list, error: listError } = id ? await getListById(supabase, id) : await getListByName(supabase, name);

    if (listError || !list) {
        throw createError({
            statusCode: 404,
            message: 'List not found',
        });
    }

    // Get todos for this list (using snake_case field name)
    const { data: listTodos, error: todosError } = await supabase
        .from('Todos')
        .select('*')
        .eq('list_id', id)
        .order('order', { ascending: true });

    if (todosError) {
        console.error('Error fetching todos:', todosError);
    }

    // Return list with todos embedded for compatibility with existing frontend code
    return { ...objectToCamel(list), todos: objectToCamel(listTodos) };
}

async function getListById(supabase: SupabaseClient, id: string) {
    return await supabase
        .from('Lists')
        .select('*')
        .eq('id', id)
        .single();
}

async function getListByName(supabase: SupabaseClient, name: string) {
    return await supabase
        .from('Lists')
        .select('*')
        .ilike('name', `%${name}%`)
        .single();
}
