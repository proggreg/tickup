import { createClient } from '@supabase/supabase-js';

export async function deleteLists() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    await supabase.auth.signInWithPassword({
        email: 'testuser@example.com',
        password: 'password',
    });

    const { data: deletedLists, error: deleteError } = await supabase
        .from('Lists')
        .delete()
        .not('id', 'is', null)
        .select();

    if (deleteError) {
        console.error('Error deleting lists:', deleteError);
    }
    else {
        console.log(`Deleted ${deletedLists?.length || 0} list(s) for test user`);
    }
}
