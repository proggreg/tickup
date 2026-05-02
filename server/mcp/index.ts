import { parseCookies } from 'h3';

export default defineMcpHandler({
    middleware: async (event) => {
        const cookies = parseCookies(event);
        const hasSupabaseSession = Object.keys(cookies).some(
            k => k.startsWith('sb-') && k.endsWith('-auth-token'),
        );
        if (hasSupabaseSession) event.context.hasSession = true;
    },
});
