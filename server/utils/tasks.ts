import { SupabaseClient } from '@supabase/supabase-js';

export class TaskService {
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async create(task: Task) {
        return await this.supabase.from('Todos').insert([task]).select();
    }
}
