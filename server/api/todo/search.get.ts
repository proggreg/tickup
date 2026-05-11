import { mcpSupabaseClient } from '../../mcp/utils/auth';
import { objectToCamel } from 'ts-case-convert';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { name, githubBranchName } = query;

    if (!name && !githubBranchName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Must provide either name or githubBranchName query parameter',
        });
    }

    const supabase = await mcpSupabaseClient(event);

    let queryBuilder = supabase.from('Todos').select('*');

    if (name) {
        queryBuilder = queryBuilder.eq('name', name);
    } else if (githubBranchName) {
        queryBuilder = queryBuilder.eq('github_branch_name', githubBranchName);
    }

    const { data, error } = await queryBuilder.single();

    if (error) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Todo not found',
        });
    }

    if (data) {
        return objectToCamel(data);
    }

    return data;
});
