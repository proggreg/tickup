import { defineEventHandler, createError, getQuery } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('vercel_access_token, vercel_team_id')
        .eq('id', user.sub)
        .single();

    if (!userData?.vercel_access_token) {
        throw createError({ statusCode: 403, message: 'Vercel integration not connected.' });
    }

    const { projectId } = getQuery(event);
    const safeProjectId = Array.isArray(projectId) ? projectId[0] : String(projectId ?? '');

    if (!safeProjectId) {
        throw createError({ statusCode: 400, message: 'Missing projectId' });
    }

    const params = new URLSearchParams({
        projectId: safeProjectId,
        limit: '1',
    });
    if (userData.vercel_team_id) {
        params.set('teamId', userData.vercel_team_id);
    }

    let data: any;
    try {
        const res = await fetch(`https://api.vercel.com/v6/deployments?${params.toString()}`, {
            headers: { Authorization: `Bearer ${userData.vercel_access_token}` },
        });
        data = await res.json();

        if (!res.ok) {
            throw new Error(data.error?.message || 'Failed to fetch deployments');
        }
    } catch (error: any) {
        console.error('Error fetching Vercel deployment:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to fetch deployment',
        });
    }

    const deployment = data.deployments?.[0];
    if (!deployment) {
        throw createError({ statusCode: 404, message: 'No deployments found for this project.' });
    }

    return {
        id: deployment.uid,
        url: `https://${deployment.url}`,
        state: deployment.state,
        readyState: deployment.readyState,
        createdAt: deployment.createdAt || deployment.created,
    };
});
