import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line import/no-mutable-exports
let supabase: SupabaseClient;

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
        console.warn('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
        return;
    }

    supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseAnonKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        },
    );

    return {
        provide: {
            supabase,
        },
    };
});

export { supabase };
