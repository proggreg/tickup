---
name: bugsnag-repro
description: Turn a Bugsnag bug (error ID, dashboard URL, or a description like "fix that PUT /api/todo error") into a failing regression test that reproduces it, using the mcp__bugsnag__* tools plus repo code search. Use whenever the user hands you a Bugsnag error, asks to "reproduce this bug", "write a test for this Bugsnag error", "create tasks/tests for recent bugsnag bugs", or references an error by its Bugsnag error ID / event ID / dashboard link. Stops once a red (failing) test demonstrates the bug — it does not implement the fix. Out of scope for bugs in MCP tools (server/mcp/tools/*) — those follow the separate paired test-task/branch convention in tickup-test-creation.md instead.
---

# Bugsnag → reproducing test

Goal: given a Bugsnag bug, come out the other end with a **failing test** that
demonstrates it, plus enough context that whoever fixes it (you, later, via
`/investigate` or normal implementation, or a teammate) doesn't have to
re-derive what you just learned. Do not fix the bug in this pass — a red test
is the deliverable, not a green one.

**Out of scope:** bugs inside `server/mcp/tools/*` (MCP tool implementations).
Those have their own paired test-task/branch convention — see the "MCP tool
development workflow" section of `CLAUDE.md` and the `tickup-test-creation`
skill. Using this skill on an MCP tool bug would fight that convention rather
than follow it, so hand those off instead of writing an ad-hoc test here.

## 1. Resolve the bug

If given an error ID or dashboard URL, extract the error ID and go straight to
step 2. If given a description instead, find the project first — this repo
normally has exactly one Bugsnag project ("Tickup"), so `bugsnag_list_projects`
resolves it without needing to ask the user:

```
bugsnag_list_projects()  →  grab the project id
bugsnag_list_project_errors(projectId, sort: "last_seen")  →  match by message/context
```

## 2. Investigate — pull the full picture, not just the message

Call `bugsnag_get_error(errorId, projectId)`. This one call gives you the most
useful signal:

- **`latest_event.exceptions[].stacktrace`** — frames with `in_project: true`
  point straight at the file/line that threw. Open that file next.
- **`latest_event.breadcrumbs`** — the sequence of UI clicks / fetch calls
  leading up to the crash. This is usually the fastest way to reconstruct
  concrete repro steps ("user taps checkbox on 3 todos within ~1s while on
  `/`"), especially for bugs that don't reproduce from a single isolated
  action.
- **`release_stages`** — whether this only happens in `preview`, only in
  `production`, or both. Only-preview bugs are worth a second thought before
  assuming they generalize.

If the same error class recurs a lot, `bugsnag_get_events_on_an_error` shows
multiple occurrences at once — useful for spotting what's actually common
across them (same user? same burst-of-clicks pattern? same payload shape?)
versus what's incidental to one event.

### When the trail goes cold: server-side errors with no real message

Nitro's `createError({ statusCode: 500, statusMessage: error.message })`
pattern (used throughout `server/api/`) frequently loses the actual error text
by the time it reaches the browser — H3 suppresses `statusMessage` detail in
production, so the Bugsnag client event just shows something like
`[PUT] "/api/todo/4401": 500 ` with nothing after the status code. When that
happens:

1. Check whether the throwing route already does `console.error(error)`
   before `throw createError(...)`. If it doesn't, that's the actual gap —
   there's no way to see the real cause after the fact, from Bugsnag or
   anywhere else.
2. Try Vercel's runtime logs for the event's `received_at` timestamp, scoped
   tight (a minute or two either side) and to the right `environment`
   (`preview`/`production`) — `get_runtime_logs` for raw output,
   `get_runtime_errors` for clustered exceptions. Note: `get_runtime_errors`
   only picks up things that were actually `console.error`'d or thrown
   unhandled — a clean `throw createError(...)` with no logging produces
   **no entry there either**. Don't spend long on this if the route has no
   logging; it won't be there.
3. If the real server-side cause genuinely isn't recoverable, say so plainly
   in your summary rather than guessing at a root cause you can't back up,
   and add `console.error(error)` at the throw site as a small, separate fix
   so the *next* occurrence is debuggable. This is worth doing even though
   it's not "the fix" — it's closing the diagnostic gap you just hit.

Project ID for Vercel MCP calls comes from `.vercel/project.json`
(`projectId`, `orgId` → pass as `teamId`).

## 3. Pick the test type

Match the layer the bug actually lives in — don't reach for Playwright for a
pure store/composable bug, and don't reach for vitest for something that only
manifests through real UI interaction sequences (breadcrumbs will tell you
which):

- **Store action, composable, or other pure logic** → vitest unit test. See
  the `vitest` skill for this repo's conventions.
- **API route in `server/api/`** → either a vitest test hitting the handler
  directly, or (if the bug depends on real auth/RLS/Supabase behavior) an e2e
  test that calls the route through Playwright's request context.
- **UI-driven bug** (a specific sequence of clicks, a specific component
  state) → Playwright e2e test. Import `test`/`expect` from
  `e2e/fixtures/index.ts`, **not** `@playwright/test` directly — that's what
  gives you the `listAPI` fixture for setting up/tearing down lists via the
  API in `beforeEach`. Use `getByRole`, `getByTestId`, or `.v-list-item`
  selectors per the repo's e2e conventions; avoid broad `div` locators.

If the bug requires an authenticated session and `user.json` doesn't exist yet
or looks stale, regenerate it:

```
npx playwright test e2e/global.setup.ts
```

This logs in as `testuser@example.com` / `password` and saves cookie-based
Supabase auth state for reuse.

## 4. Write the test — and make sure it's actually red

Write the smallest test that encodes the breadcrumb sequence, not just the
final failing call in isolation. If the breadcrumbs show three rapid actions
before the crash, a test that only replays the third one may pass even though
the bug is real — you'd be testing a different, easier scenario than the one
that shipped a bug.

**Concurrency/race bugs are the case to be careful with.** A single isolated
request will often succeed locally even when the real bug only shows up under
a burst of near-simultaneous requests (this is not hypothetical — confirmed
firsthand that 5 concurrent PUTs succeeded fine against a local dev server
even via cookie auth, while the same pattern was failing in production).
When that's what the breadcrumbs show:

- Write the test to fire the same burst shape (e.g. `Promise.all` of N
  concurrent calls hitting the same store action or route), because that's
  the only way the test has a chance of catching a regression later, even if
  it can't be proven to fail in your current environment.
- Run it and see what actually happens. If it passes locally, **say so
  explicitly** in your summary rather than implying you've proven the repro —
  something like "this encodes the suspicious pattern from the breadcrumbs
  but did not fail locally; the failure may be environment-specific
  (serverless concurrency, connection limits under real load) that a local
  dev server won't hit." A false "reproduced" claim is worse than an honest
  "couldn't confirm, but here's the shape."

For everything else, actually run the test before calling it done and confirm
it fails for the reason you expect (not a setup/typo error). A test that
passes by accident, or fails for the wrong reason, doesn't demonstrate the
bug.

## 5. Hand off

Once you have a red test (or an honest best-effort one for the concurrency
case), stop. Summarize for the user:

- The bug, in one line, and the Bugsnag error URL.
- What the test file is and why it's shaped the way it is (especially if it's
  encoding a burst/race pattern that didn't reproduce locally — don't let
  that nuance get lost).
- Any diagnostic gap you closed along the way (e.g. added `console.error` to
  an otherwise-silent failure path).
- A pointer to what should happen next — implement the fix against this test,
  e.g. via `/investigate` or just directly, depending on how well-understood
  the cause already is.

Don't implement the fix yourself in this pass unless the user explicitly asks
you to keep going.
