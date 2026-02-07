import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

interface TokenData {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_token_expires_in?: number;
}

/**
 * Checks if a GitHub access token is expired and refreshes it if needed
 * @param supabase - Supabase client instance
 * @param userId - User ID to fetch/update token for
 * @returns Valid access token
 */
export async function getValidGithubToken(
    supabase: SupabaseClient<Database>,
): Promise<string> {
    const { data: integration, error } = await supabase
        .from('user_integrations')
        .select('access_token, refresh_token, expires_at')
        .eq('provider', 'GitHub')
        .single();

    console.log('integration', integration);

    if (error || !integration) {
        throw new Error('GitHub integration not found');
    }

    return integration.access_token;
}

/**
 * Refreshes a GitHub access token using a refresh token
 * @param refreshToken - GitHub refresh token
 * @param config - Runtime config containing GitHub OAuth credentials
 * @returns New token data
 */
async function refreshGithubToken(
    refreshToken: string,
    config: ReturnType<typeof useRuntimeConfig>,
): Promise<TokenData> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            client_id: config.private.github.clientId,
            client_secret: config.private.github.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh GitHub token: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`GitHub token refresh error: ${data.error_description || data.error}`);
    }

    return data;
}
