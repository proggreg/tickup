import { parseCookies, getHeader, getRequestURL } from 'h3';
import { verifySupabaseAccessToken } from '../utils/oauth';

export default defineMcpHandler({
    middleware: async (event) => {
        const cookies = parseCookies(event);
        const hasSupabaseSession = Object.keys(cookies).some(
            k => k.startsWith('sb-') && k.endsWith('-auth-token'),
        );
        if (hasSupabaseSession) {
            event.context.hasSession = true;
            return;
        }

        const auth = getHeader(event, 'authorization');
        if (auth?.toLowerCase().startsWith('bearer ')) {
            const token = auth.slice(7).trim();
            const supabaseUrl = useRuntimeConfig(event).public.supabaseUrl as string | undefined;
            if (supabaseUrl) {
                const claims = await verifySupabaseAccessToken(token, { supabaseUrl });
                if (claims) {
                    event.context.hasSession = true;
                    event.context.user = { id: claims.sub };
                    event.context.oauthClientId = claims.client_id;
                    event.context.bearerToken = token;
                    return;
                }
            }
        }

        const origin = getRequestURL(event).origin;
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
                'WWW-Authenticate': `Bearer realm="mcp", resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
            },
        });
    },
});
