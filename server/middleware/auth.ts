export default defineEventHandler(async (_event) => {
  // Skip authentication for AWS routes for now - will be handled by client-side middleware
  // This avoids the cookie parsing issues we're experiencing with server-side Supabase
})
