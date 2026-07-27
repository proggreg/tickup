---
title: MCP Server Architecture
type: architecture
updated: 2026-07-26
---

# MCP Server Architecture

Tickup exposes an MCP server via `@nuxtjs/mcp-toolkit`. It's mounted at `/mcp` and authenticated via OAuth bearer tokens (see [[architecture/auth.md]]).

## Structure

```
server/mcp/
  index.ts           # defineMcpHandler — auth middleware
  tools/
    hello.ts
    get-lists.ts
    todo/
      create-todo.ts
      get-todo.ts
      get-todos.ts
      get-subtasks.ts
      search-todos.ts
      update-todo.ts
    list/
      create-list.ts
      delete-list.ts
      get-list.ts
      get-list-todos.ts
      reorder-list-todos.ts
      update-list.ts
    github/
      check-github-connection.ts
      connect-github.ts
      create-github-branch.ts
      delete-github-webhook.ts
      disconnect-github.ts
      get-github-branch.ts
      list-github-branches.ts
      list-github-repos.ts
      list-github-webhook-subscriptions.ts
      subscribe-github-webhooks.ts
      unsubscribe-github-webhooks.ts
    aws/
      generate-list-banner.ts
    metadata/
      get-url-metadata.ts
  resources/
    claude-md.ts     # exposes CLAUDE.md as an MCP resource
  prompts/
    code-review.ts
  utils/
    auth.ts          # mcpUserId, mcpSupabaseClient
    api.ts           # callApi — delegates to Nitro API with auth forwarding
```

## Tool inventory

### Todo tools
| Tool | Purpose |
|------|---------|
| `create-todo` | Create new todo |
| `get-todo` | Get single todo by id |
| `get-todos` | Get todos (today/overdue/recent queries) |
| `get-subtasks` | Get subtasks for a todo |
| `search-todos` | Full-text search across todos |
| `update-todo` | Update todo fields |

### List tools
| Tool | Purpose |
|------|---------|
| `create-list` | Create new list |
| `delete-list` | Delete a list |
| `get-list` | Get single list |
| `get-list-todos` | Get todos in a list |
| `get-lists` | Get all lists |
| `reorder-list-todos` | Reorder todos within a list |
| `update-list` | Update list fields |

### GitHub tools
| Tool | Purpose |
|------|---------|
| `check-github-connection` | Check if GitHub is connected |
| `connect-github` | Connect GitHub account |
| `create-github-branch` | Create branch linked to todo |
| `delete-github-webhook` | Delete a webhook |
| `disconnect-github` | Disconnect GitHub |
| `get-github-branch` | Get branch details |
| `list-github-branches` | List branches |
| `list-github-repos` | List repos |
| `list-github-webhook-subscriptions` | List webhook subscriptions |
| `subscribe-github-webhooks` | Subscribe to webhook events |
| `unsubscribe-github-webhooks` | Unsubscribe |

### Other tools
| Tool | Purpose |
|------|---------|
| `hello` | Healthcheck / ping |
| `generate-list-banner` | AWS image generation for list banners |
| `get-url-metadata` | Fetch metadata for a URL |

## Auth middleware

Every MCP request goes through `server/mcp/index.ts`:
1. Check for Supabase session cookie → `hasSession = true`
2. Check for `Authorization: Bearer <token>` → verify via `verifySupabaseAccessToken` → set `hasSession`, `user`, `oauthClientId`, `bearerToken`
3. Neither found → 401 with `WWW-Authenticate` header pointing to resource metadata

## Testing

MCP tools have integration tests in `test/unit/mcp/`. Tests call `localhost:3000/mcp` directly (HTTP). Coverage requires the dev server running with `NODE_V8_COVERAGE`. See [[conventions/testing.md]].

## Known gotcha: `desc` field

The `Todos` DB column for a todo's description is `desc`, not `description`. `objectToSnake` does NOT rename this. Any tool accepting `description` must manually remap: `{ desc: input.description }`. See [[conventions/gotchas.md]].

## Related

- [[architecture/auth.md]] — authentication detail
- [[api/routes.md]] — Nitro API routes that some MCP tools delegate to
- [[conventions/gotchas.md]] — known issues including `desc` gotcha
