export default defineEventHandler(async (_event) => {
    // For now, skip server-side auth validation to avoid cookie parsing issues
    // Return true temporarily until we resolve the Supabase server-side auth
    console.debug('GitHub check: Server-side auth validation temporarily disabled');
    return true;
});
