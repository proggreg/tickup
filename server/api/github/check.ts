import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);

    if (!user) {
        return false;
    }

    const supabase = await serverSupabaseClient(event);
    const { data } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.id)
        .single();

    return !!data?.github_installation_id;
});
