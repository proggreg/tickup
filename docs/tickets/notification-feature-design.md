---
Status: in-progress
taskId: 4407
title: Design and plan notification feature
priority: high
---

## Implementation status

Phase 1 (finish the push vertical slice) is implemented:
`server/api/subscribe.post.ts` / `subscribe.delete.ts` persist/remove push
subscriptions, `service-worker/sw.ts` handles `push`/`notificationclick`,
`app/composables/useNotificationSettings.ts` + a row in
`Settings/Integrations` drive opt-in/opt-out, `scheduleNotifications.ts`
now prunes expired (404/410) subscriptions, and
`.github/workflows/notifications.yml` triggers the endpoint every 15
minutes. `server/utils/scheduleNotifications.ts` (dead duplicate) is
removed. Phase 2 (persistent in-app notification list) is not started.

# Design and plan notification feature

Branch: `claude/notification-feature-design-cju26k`

## Current state audit

There's already partial, uncompleted notification infrastructure in the repo. Any plan has to
account for this rather than design from a blank slate:

- **Schema**: `Todos.notification_date_time` (timestamp) and `Todos.notification_sent` (bool)
  already exist. `Users.push_subscriptions` (jsonb) already exists.
- **`server/api/scheduleNotifications.ts`**: a working Nitro endpoint, gated by an
  `x-cron-secret` header (`SCHEDULER_SECRET` env var), that queries todos with a past-due
  `notification_date_time` and `notification_sent = false`, sends a web-push notification to
  every subscription on the owning user, and marks the todo notified. Uses `web-push` +
  VAPID keys from `useRuntimeConfig()`. Nothing currently calls this endpoint — no cron job,
  scheduled task, or GitHub Action triggers it.
- **`server/api/subscribe.ts`**: intended to register a browser's push subscription and/or
  schedule a todo's notification, but it's a stub left over from a pre-Supabase migration —
  the body reads `subscription`/`username`/`todoId` but the actual Supabase writes are
  commented out (`// Note: ... would need to be implemented in Supabase`). It sends a *test*
  push if no `notificationDateTime` is given, but does not persist a subscription anywhere.
- **`server/utils/scheduleNotifications.ts`**: a standalone script (not wired into any command
  or workflow) that duplicates `scheduleNotifications.ts` but queries camelCase columns
  (`notificationDateTime`, `notificationSent`, `pushSubscriptions`, `userId`) that don't match
  the actual snake_case DB schema. This is dead/stale code from before the `ts-case-convert`
  convention was adopted.
- **PWA config**: `nuxt.config.ts` configures `@vite-pwa/nuxt` with `srcDir: 'service-worker'`,
  `filename: 'sw.ts'`, `strategies: 'injectManifest'` — but no `service-worker/` directory
  exists in the repo. There is no service worker source file, so there's no `push` event
  listener client-side and no way for a browser to actually receive a web-push message today,
  regardless of server-side readiness.
- **Frontend**: no UI anywhere calls `Notification.requestPermission()`, registers a
  `PushManager` subscription, or posts to `/api/subscribe`. `useNotification()`
  (`app/composables/useNotification.ts`) is unrelated — it's a purely in-memory snackbar
  singleton (`show` / `message` / `link`) for one-off toasts within an active session; it has
  no concept of a notification list, unread state, or persistence.

**Conclusion**: the "push reminder" feature was started and abandoned roughly half-built. The
design below treats finishing that vertical slice as phase 1, and layers a broader in-app
notification system on top.

## Goals

Give users timely reminders about their todos, both while the app is open (in-app) and when
it isn't (push), without duplicating or fighting the existing `useNotification()` snackbar.

## Triggers (phase 1 scope: todo due reminders only)

- A todo's `notification_date_time` elapses (existing mechanism — reuse as-is).
- Out of scope for phase 1, listed for later phases: overdue todo digest, list-sharing/mentions,
  GitHub webhook events (branch/PR status change — `server/mcp/tools/github/*` already models
  webhook subscriptions per-user, could feed the same delivery layer later).

## Delivery channels

1. **Push (web-push)** — for reminders when the app/tab is closed. Reuses existing
   `web-push` + VAPID setup; needs the missing pieces below to actually work.
2. **In-app** — when the user has the app open at fire time, prefer an in-app surface over a
   redundant OS push. Two sub-cases:
   - Toast: reuse `useNotification()` as-is for the momentary "Reminder: X is due" alert.
   - Persistent: add a small unread-count/bell so reminders aren't lost if the toast is missed
     (`useNotification()` intentionally has no memory — this needs new state).

## Data model changes needed

- No new column needed for phase 1 delivery (existing `notification_date_time` /
  `notification_sent` / `push_subscriptions` cover it), **but** `push_subscriptions` being a
  single unstructured `jsonb` blob on `Users` needs a defined shape:
  `{ endpoint, keys: { p256dh, auth } }[]` — document this, since `subscribe.ts` never actually
  writes to it today and there's no validation.
- Phase 2 (persistent in-app notification list): new `Notifications` table
  (`id, user_id, todo_id nullable, type, title, body, link, read_at nullable, created_at`)
  rather than overloading `Todos`. Keeps notification history independent of todo lifecycle
  (e.g. surviving todo deletion) and generalizes past todo-only triggers.

## Backend work

1. Rewrite `server/api/subscribe.ts` to actually persist subscriptions: on `POST` with a
   `PushSubscription`, upsert it into the authenticated user's `push_subscriptions` array
   (dedupe by `endpoint`). Drop the todo-scheduling branch — scheduling already happens by
   setting `notification_date_time` via the existing todo update flow, not via this endpoint.
2. Add a `DELETE`/unsubscribe path so disabling notifications in-browser removes the stored
   subscription (needed for `410 Gone` cleanup when `webpush.sendNotification` fails because a
   subscription expired — `scheduleNotifications.ts` currently swallows that error and never
   prunes the dead subscription).
3. Delete `server/utils/scheduleNotifications.ts` (dead, schema-mismatched duplicate) once a
   real trigger for `server/api/scheduleNotifications.ts` exists.
4. Wire up a trigger for `scheduleNotifications.ts` — it's a plain Nitro endpoint today with no
   caller. Candidates: a scheduled GitHub Action (`.github/workflows/`) hitting the deployed URL
   with the `x-cron-secret` header on a `schedule:` cron, or Nitro's built-in task scheduler
   if the hosting target supports it. Needs a decision (see Open questions).
5. Phase 2: `POST /api/notifications` (internal, used by the reminder job and future trigger
   types) + `GET /api/notifications` + `PATCH /api/notifications/:id` (mark read), all under
   `server/api/notifications/`, following the existing `objectToSnake`/`objectToCamel` boundary
   convention.

## Frontend work

1. Add the missing `service-worker/sw.ts` (required by the existing `injectManifest` PWA
   config) with a `push` event listener that calls `self.registration.showNotification(...)`
   and a `notificationclick` handler that focuses/opens the relevant todo.
2. Add an opt-in flow: a settings toggle or prompt that calls
   `Notification.requestPermission()`, then `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`, then POSTs the resulting subscription to
   `/api/subscribe`.
3. Phase 2: a notification bell in the app header (badge = unread count) opening a list backed
   by `GET /api/notifications`, using the existing `useDialog()`/`AppDialog` pattern if it's a
   dialog, or a `v-menu` if it's a dropdown — TBD by whoever implements, not a blocking design
   decision.
4. Leave `useNotification()` untouched for its current purpose (transient snackbars). Do not
   merge it with the persistent notification list — different lifecycles, different state shape.

## Interaction with `useNotification()`

Keep them separate and composable rather than merging:
- `useNotification().notify(...)` stays the mechanism for "toast right now" — reused as the
  in-app path for a reminder firing while the tab is open.
- The new persistent list (phase 2) is a separate `useState` singleton (e.g. `useNotifications()`
  returning `items`/`unreadCount`), read from `/api/notifications`. A reminder firing can do
  both: push a toast via `useNotification()` *and* append to the persistent list, independently.

## Rollout plan

1. **Phase 1 — finish the push vertical slice**: fix `subscribe.ts`, add `service-worker/sw.ts`,
   add the opt-in UI, wire a real trigger for `scheduleNotifications.ts`, delete the dead
   `utils/scheduleNotifications.ts` script. Ship behind no flag — it's additive and the
   endpoint already no-ops safely for users with no subscriptions.
2. **Phase 2 — persistent in-app notifications**: `Notifications` table + API + bell UI.
3. **Phase 3 (not designed here)**: additional trigger types (overdue digest, GitHub webhook
   events, sharing/mentions) feeding the same `Notifications` table/delivery layer.

## Open questions

- What triggers `scheduleNotifications.ts` in production — GitHub Actions cron, or something
  hosting-provider-specific? Depends on where this app is actually deployed; needs an answer
  before phase 1 backend work #4 can be implemented.
- Should push notification opt-in be a global user setting or per-todo (e.g. only todos with
  an explicit reminder set get pushed, others never do)? Current schema already implies
  per-todo (`notification_date_time` is per-todo), so likely no separate global toggle is
  needed beyond "has this browser subscribed at all."
- Retention/cleanup policy for the phase-2 `Notifications` table (e.g. auto-delete read
  notifications after N days) — not needed to start, but affects table design if answered now
  vs. later.
