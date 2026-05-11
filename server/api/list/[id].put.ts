import { serverSupabaseClient } from '#supabase/server';
import { objectToSnake } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<List>(event);
        const client = await serverSupabaseClient(event);

        if (!body.id) {
            throw createError({
                statusCode: 400,
                statusText: 'List id is required',
            });
        }

        // Build update object conditionally to avoid undefined values
        const updateData: Partial<{
            name: string;
            github_repo: string;
            list_type: ListType;
            default_view: View;
        }> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.githubRepo !== undefined) updateData.github_repo = body.githubRepo;
        if (body.listType !== undefined) updateData.list_type = body.listType;
        if (body.defaultView !== undefined) updateData.default_view = body.defaultView;

        // Use objectToSnake for full conversion (handles any additional fields)
        const snakeUpdateData = objectToSnake(updateData);

        return await client.from('Lists').update(snakeUpdateData).eq('id', body.id).select();
    } catch (error) {
        return error;
    }
});
