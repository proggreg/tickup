import { serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const code = query.code as string;

    if (!code) {
        return sendRedirect(event, '/settings/vercel?vercel=error&reason=missing_code');
    }

    const user = await serverSupabaseUser(event);
    if (!user) {
        return sendRedirect(event, `/settings/vercel?vercel=pending&code=${code}`);
    }

    try {
        await $fetch('/api/vercel/connect', {
            method: 'POST',
            body: { code },
            headers: { cookie: getHeader(event, 'cookie') || '' },
        });
    } catch {
        return sendRedirect(event, '/settings/vercel?vercel=error&reason=connect_failed');
    }

    return sendRedirect(event, '/settings/vercel?vercel=connected');
});
