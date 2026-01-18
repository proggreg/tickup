import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database

teardown('delete database', async () => {
    console.log('deleting test database...');
    // Using service role key (SUPABASE_KEY) which bypasses RLS policies
    // This allows us to delete lists regardless of row-level security
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
});
