import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const body = await readBody(event);
    const code = body.code;

    if (!code) {
        throw createError({ statusCode: 400, statusMessage: 'Missing code' });
    }

    const config = useRuntimeConfig();

    const tokenRes = await fetch('https://api.vercel.com/v2/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.vercel.clientId,
            client_secret: config.vercel.clientSecret,
            code,
            redirect_uri: config.vercel.redirectUri,
        }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        throw createError({
            statusCode: 502,
            statusMessage: tokenData.error_description || 'Failed to exchange Vercel OAuth code',
        });
    }

    const supabase = await serverSupabaseClient(event);

    const updateData: Record<string, unknown> = {
        id: user.id,
        vercel_access_token: tokenData.access_token,
    };
    if (tokenData.team_id) {
        updateData.vercel_team_id = tokenData.team_id;
    }

    const { error } = await supabase.from('Users').upsert(updateData);

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return { success: true };
});
