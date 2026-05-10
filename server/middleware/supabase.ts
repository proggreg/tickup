// server/middleware/supabase.ts
import { mcpSupabaseClient } from '../mcp/utils/auth';

export default defineEventHandler(async (event) => {
    event.context.supabase = await mcpSupabaseClient(event);
});
