import { test as teardown } from '@playwright/test';
import { deleteLists } from './helpers/teardown';

// Create a single supabase client for interacting with your database

teardown('delete database', async () => {
    console.log('deleting test database...');

    deleteLists();
});
