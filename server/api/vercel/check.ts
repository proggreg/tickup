import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);

    if (!user) {
        return false;
    }

    const supabase = await serverSupabaseClient(event);
    const { data } = await supabase
        .from('Users')
        .select('vercel_access_token')
        .eq('id', user.sub)
        .single();

    return !!data?.vercel_access_token;
});
