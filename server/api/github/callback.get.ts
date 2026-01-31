import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const installationId = query.installation_id as string;
    const code = query.code as string;
    const supabase = await serverSupabaseClient(event);
    const config = useRuntimeConfig();

    if (!installationId) {
        // If no installation_id, redirect to settings with error
        return sendRedirect(event, '/settings/github?github=error&reason=missing_installation_id');
    }

    // Try server-side auth first
    const user = await serverSupabaseUser(event);
    if (!user) {
        // User session not available server-side during redirect from GitHub.
        // Redirect to a client-side page that can handle it with the session cookie.
        const params = new URLSearchParams({
            installation_id: installationId,
            ...(code && { code }),
        });
        return sendRedirect(event, `/settings/github?github=pending&${params.toString()}`);
    }

    // Exchange code for GitHub username
    let githubUsername: string | null = null;
    if (code) {
        try {
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    client_id: config.private.github.clientId,
                    client_secret: config.private.github.clientSecret,
                    code,
                }),
            });
            const tokenData = await tokenRes.json();

            if (tokenData.access_token) {
                const userRes = await fetch('https://api.github.com/user', {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` },
                });
                const githubUser = await userRes.json();
                githubUsername = githubUser.login;
                const integrationtokenData = {
                    user_id: user.sub,
                    provider: 'GitHub',
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                };
                const { error } = await supabase.from('user_integrations').upsert(integrationtokenData);

                console.error(error);
            }
        }
        catch (e) {
            console.error('Failed to exchange GitHub code:', e);
        }
    }

    const updateData: Record<string, unknown> = {
        id: user.sub,
        github_installation_id: parseInt(installationId),
    };
    if (githubUsername) {
        updateData.github_username = githubUsername;
    }

    const { error } = await supabase
        .from('Users')
        .upsert(updateData);

    if (error) {
        console.error('Failed to save GitHub installation:', error);
        return sendRedirect(event, '/settings/github?github=error&reason=save_failed');
    }

    return sendRedirect(event, '/settings/github?github=connected');
});
