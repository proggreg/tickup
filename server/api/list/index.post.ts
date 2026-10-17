import { serverSupabaseClient } from '#supabase/server';
import { objectToCamel, objectToSnake } from 'ts-case-convert';

interface CreateListBody {
    name?: string;
    icon?: string;
    defaultView?: string;
    template?: string;
}

export default defineEventHandler(async (event) => {
    const body = (await readBody<CreateListBody>(event)) ?? {};
    const supabase = await serverSupabaseClient(event);
    try {
        const template = body.template
            ? LIST_TEMPLATES[body.template as keyof typeof LIST_TEMPLATES]
            : undefined;

        if (body.template && !template) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Unknown list template',
            });
        }

        // Explicit body values win over the template, which wins over the defaults
        const listData = {
            name: body.name || template?.name,
            icon: body.icon ?? template?.icon,
            defaultView: body.defaultView ?? template?.defaultView,
        };

        if (!listData.name) {
            throw createError({
                statusCode: 400,
                statusMessage: 'List name is required',
            });
        }

        // Drop unset fields so the DB column defaults apply instead of NULL
        const row = Object.fromEntries(
            Object.entries(objectToSnake(listData)).filter(([, value]) => value !== undefined),
        );

        const { data, error } = await supabase.from('Lists').insert([row]).select();

        if (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        // Keep the snake_case fields for existing callers and add camelCase ones
        const result = data[0];
        return result ? { ...result, ...objectToCamel(result) } : result;
    } catch (error) {
        if (isError(error)) throw error;

        console.error('Error creating list:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create list',
        });
    }
});
