---
name: tickup-relay
description: Autonomous task relay — picks next tickup task, executes, marks done, exits. One task per run.
argument-hint: "[optional task-id]"
---

# Tickup Relay

One engineer per task. Pick next, execute, mark done, exit. Next engineer takes over.

## When to Use

Tactical, bounded tickup tasks that don't need review before shipping. Small features, fixes, MCP tool tests.

**Don't use if:**
- Task needs human review before shipping
- Cross-project or strategic work (use vault project instead)
- Production change with no rollback

## On Start

1. **Check git state**: `git status` and `git log -1 --oneline`
2. **Check CI**: Most recent run must be green. Wait if `in_progress`/`queued`. If failed, fix it before picking new work.
3. **Look for `in_progress` task first**. Use tickup MCP `get_todo` with a task name or id. If one exists, use `get_subtasks` with the task id to get the work to be done, then resume it — see "Recovery" below.
4. **Pick next todo**. Query tickup tasks with status pending/todo. Skip blocked. Pick best candidate (unlocks downstream work first). State pick + one-liner rationale.
5. ** Check the branch is update to date with parent todo's branch
6. **If argument passed**, use that task ID instead.
7. **If nothing pickable and CI green**, print "No todo tasks — nothing to do." and exit.

## Recovery (task already `in_progress`)

1. Read task name, description, linked branch.
2. Run `git status` and check for uncommitted work.
3. Run tests.

| Working tree | Tests | Action |
|---|---|---|
| Clean | Pass | Verify done, mark completed |
| Clean | Fail | Fix, mark completed |
| Dirty | Pass | Finish work, mark completed |
| Dirty | Fail | Read notes, fix or redo |

## Claim Task

Update task status to `in_progress` via tickup MCP `update_todo`.

## Do the Work

1. Understand goal — what does done look like?
2. Write failing test first (if test needed).
3. Make it pass with minimal change.
4. Refactor for clarity, no scope creep.
5. Stay in scope — unrelated issues → new task or notes.

## Verify

Run tests: `pnpm test:coverage` or `pnpm e2e` or project's test command.

For UI: verify visually if possible.

**All checks green before marking done.**

## Commit and Push

```
<task name>

Closes tickup task #<id>.

<one or two sentences on what changed and why>
```

Watch build to completion. If red, fix locally, commit (no `--amend`), push, re-watch.

## Create a PR

Create a PR for a subtask with the parent task's branch as the target branch. If the task is a parent task, target the main branch.

## Mark In Review

Update task status to `in review` with `completed_date` via tickup MCP `update_todo`.

## CI Discipline

After every push, watch run green before exiting. If fails, fix → commit → push → re-watch. Two failures → mark task `blocked` with notes.

## If Stuck

Append notes to task, mark `blocked`, commit, exit.

## Scope Discipline

- One task per run.
- Don't refactor unrelated code.
- One clear goal per task.

## Usage

```
/tickup-relay              # Pick next todo task
/tickup-relay 2115         # Work on task #2115
```

Loop continuously:
```
/loop 5m /tickup-relay
```
