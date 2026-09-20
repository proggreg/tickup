---
title: Auth System
type: architecture
updated: 2026-07-26
---

# Auth System

Two separate auth paths coexist: browser sessions and MCP bearer tokens.

## Browser sessions (Supabase cookies)

- Module: `@nuxtjs/supabase`
- Session stored in cookies matching `sb-*-auth-token`
- Protected pages redirect to `/login` (configured in `nuxt.config.ts` `supabase.redirectOptions`)
- OAuth callback lands at `/confirm`
- `/oauth/consent` is excluded from redirect (OAuth consent page for MCP clients)
- In API routes: `serverSupabaseClient(event)` returns a client scoped to the user's session

## MCP bearer tokens (OAuth flow)

- MCP clients (Claude, etc.) authenticate via OAuth
- Token verified in `server/mcp/index.ts` middleware using `verifySupabaseAccessToken`
- Valid token sets on `event.context`:
  - `hasSession: true`
  - `user: { id: claims.sub }`
  - `oauthClientId: claims.client_id`
  - `bearerToken: token`
- Unauthorized: returns 401 with `WWW-Authenticate: Bearer realm="mcp", resource_metadata=...`
- Resource metadata served at `/.well-known/oauth-protected-resource`

## MCP auth utilities (`server/mcp/utils/auth.ts`)

Two helpers used by every MCP tool:

### `mcpUserId(event)`
Returns the authenticated user's ID. Checks `event.context.user.id` first (bearer path), then falls back to `serverSupabaseUser(event)` (cookie path). Throws 401 if neither.

### `mcpSupabaseClient(event)`
Returns a Supabase client scoped to the authenticated user. Bearer path: creates a new client with `Authorization: Bearer <token>` header. Cookie path: delegates to `serverSupabaseClient(event)`.

## API helper (`server/mcp/utils/api.ts`)

`callApi<T>(path, options)` — used by MCP tools that delegate to Nitro API routes rather than calling Supabase directly. It:
1. Calls `mcpUserId(event)` to ensure auth
2. Forwards cookies and request headers
3. Calls `$fetch` against the internal API

## Flow comparison

| | Browser user | MCP client |
|--|-------------|-----------|
| Token location | Cookie `sb-*-auth-token` | `Authorization: Bearer ...` header |
| Verified by | `@nuxtjs/supabase` module | `verifySupabaseAccessToken` in MCP middleware |
| User ID source | `serverSupabaseUser(event).sub` | `event.context.user.id` |
| Supabase client | `serverSupabaseClient(event)` | new client with bearer header |

## Related

- [[architecture/mcp.md]] — full MCP architecture
- [[overview.md]] — auth in context of full stack
