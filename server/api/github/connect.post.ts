import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const body = await readBody(event);
    const installationId = body.installation_id;

    if (!installationId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing installation_id' });
    }

    const config = useRuntimeConfig();

    // Exchange code for GitHub username if provided
    let githubUsername: string | null = null;
    if (body.code) {
        try {
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    client_id: config.github.clientId,
                    client_secret: config.github.clientSecret,
                    code: body.code,
                }),
            });
            const tokenData = await tokenRes.json();

            if (tokenData.access_token) {
                const userRes = await fetch('https://api.github.com/user', {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` },
                });
                const githubUser = await userRes.json();
                githubUsername = githubUser.login;
            }
        }
        catch (e) {
            console.error('Failed to exchange GitHub code:', e);
        }
    }

    const supabase = await serverSupabaseClient(event);

    const updateData: Record<string, unknown> = {
        id: user.id,
        github_installation_id: parseInt(installationId),
    };
    if (githubUsername) {
        updateData.github_username = githubUsername;
    }

    const { error } = await supabase
        .from('Users')
        .upsert(updateData);

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return { success: true };
});
