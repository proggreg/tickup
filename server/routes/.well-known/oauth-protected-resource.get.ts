import { defineEventHandler, getRequestURL, setHeader, createError } from 'h3';

export default defineEventHandler((event) => {
    const supabaseUrl = useRuntimeConfig(event).public.supabaseUrl as string | undefined;
    if (!supabaseUrl) {
        throw createError({ statusCode: 500, statusMessage: 'supabase_url_unset' });
    }
    const origin = getRequestURL(event).origin;
    setHeader(event, 'Cache-Control', 'no-store');
    return {
        resource: `${origin}/mcp`,
        authorization_servers: [`${supabaseUrl}/auth/v1`],
        bearer_methods_supported: ['header'],
        scopes_supported: ['openid', 'email', 'profile'],
    };
});
