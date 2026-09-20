---
title: API Routes
type: api
updated: 2026-07-26
---

# Nitro API Routes

All routes live in `server/api/`. Auth is handled by `server/middleware/supabase.ts` (Supabase session injection).

## Todo routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/todo` | Create todo |
| GET | `/api/todo/[id]` | Get todo by id |
| PUT | `/api/todo/[id]` | Update todo |
| DELETE | `/api/todo/[id]` | Delete todo |
| GET | `/api/todo/[id]/subtasks` | Get subtasks |
| POST | `/api/todo/search` | Search todos (body) |
| GET | `/api/todo/search` | Search todos (query) |
| POST | `/api/todo/upload` | Upload attachment |
| DELETE | `/api/todo/attachment` | Delete attachment |
| GET | `/api/todos` | Get todos; `?today`, `?overdue`, `?recent` query params |

## List routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/list` | Create list |
| GET | `/api/list/[id]` | Get list |
| PUT | `/api/list/[id]` | Update list |
| DELETE | `/api/list/[id]` | Delete list |
| GET | `/api/list/todos` | Get todos for a list (`?listId=`) |
| PUT | `/api/list/todos` | Reorder list todos |
| GET | `/api/lists` | Get all lists |

## GitHub routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/github/check` | Check GitHub connection |
| POST | `/api/github/connect` | Connect GitHub via OAuth |
| POST | `/api/github/disconnect` | Disconnect GitHub |
| GET | `/api/github/callback` | OAuth callback |
| GET | `/api/github/repos` | List repos |
| GET | `/api/github/branches` | List branches for a repo |
| GET | `/api/github/branch` | Get a branch |
| POST | `/api/github/branch` | Create a branch |
| GET | `/api/github` | GitHub info |
| POST | `/api/github/webhook/subscribe` | Subscribe to webhook events |
| DELETE | `/api/github/webhook/subscribe` | Unsubscribe |
| GET | `/api/github/webhook/subscriptions` | List subscriptions |
| DELETE | `/api/github/webhook/[id]` | Delete webhook |
| POST | `/api/github/webhook/events` | Receive webhook events |

## Other routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/attachment/[id]` | Get attachment |
| POST | `/api/aws/image` | Generate image (AWS) |
| POST | `/api/chat` | Chat endpoint |
| GET | `/api/metadata` | Fetch URL metadata |
| POST | `/api/scheduleNotifications` | Schedule push notifications |
| POST | `/api/subscribe` | Subscribe to push notifications |
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update user settings |

## MCP endpoint

| Path | Purpose |
|------|---------|
| `/mcp` | MCP server (see [[architecture/mcp.md]]) |
| `/.well-known/oauth-protected-resource` | OAuth resource metadata |

## Case conversion

Routes receive camelCase from the frontend. Before writing to Supabase: `objectToSnake()`. Before returning: `objectToCamel()`. Exception: `desc` field — see [[conventions/gotchas.md]].
