import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

interface SupabaseOAuthOptions {
    supabaseUrl: string;
}

let cachedUrl: string | undefined;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks(supabaseUrl: string) {
    if (!cachedJwks || cachedUrl !== supabaseUrl) {
        cachedUrl = supabaseUrl;
        cachedJwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
    }
    return cachedJwks;
}

export interface McpAccessTokenClaims extends JWTPayload {
    sub: string;
    client_id?: string;
}

export async function verifySupabaseAccessToken(
    token: string,
    options: SupabaseOAuthOptions,
): Promise<McpAccessTokenClaims | null> {
    try {
        const jwks = getJwks(options.supabaseUrl);
        const { payload } = await jwtVerify(token, jwks, {
            issuer: `${options.supabaseUrl}/auth/v1`,
            audience: 'authenticated',
        });
        if (typeof payload.sub !== 'string') return null;
        return payload as McpAccessTokenClaims;
    } catch {
        return null;
    }
}
