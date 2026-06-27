import { SupabaseClient } from '@supabase/supabase-js';

export class TaskService {
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async create(task: Task) {
        return await this.supabase.from('Todos').insert([task]).select();
    }

    async update(id: string | number, updates: Partial<Task>) {
        const todoId = typeof id === 'string' ? parseInt(id, 10) : id;
        const { data, error } = await this.supabase
            .from('Todos')
            .update(updates)
            .eq('id', todoId)
            .select();

        if (error) {
            return { data: null, error };
        }

        return { data: data && data.length > 0 ? data[0] : null, error: null };
    }
}
