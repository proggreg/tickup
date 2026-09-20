import { defineEventHandler, createError } from 'h3';
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

    const query = userData.vercel_team_id
        ? `?teamId=${encodeURIComponent(userData.vercel_team_id)}`
        : '';

    try {
        const res = await fetch(`https://api.vercel.com/v9/projects${query}`, {
            headers: { Authorization: `Bearer ${userData.vercel_access_token}` },
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error?.message || 'Failed to list projects');
        }

        return {
            projects: (data.projects || []).map((project: Record<string, unknown>) => ({
                id: project.id,
                name: project.name,
                framework: project.framework,
                link: project.link
                    ? {
                          type: (project.link as Record<string, unknown>).type,
                          org: (project.link as Record<string, unknown>).org,
                          repo: (project.link as Record<string, unknown>).repo,
                      }
                    : null,
                updatedAt: project.updatedAt,
            })),
        };
    } catch (error: any) {
        console.error('Error listing Vercel projects:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to list projects',
        });
    }
});
