# Wiki Schema

This wiki is a persistent, compounding knowledge base for the tickup codebase. The LLM writes and maintains it; you read it.

## Directory structure

```
wiki/
  SCHEMA.md          # this file — conventions and workflows
  index.md           # catalog of all pages (LLM reads first on any query)
  log.md             # append-only activity log
  overview.md        # high-level architecture overview
  architecture/      # data flow, auth, MCP system, modules
  components/        # Vue component pages
  stores/            # Pinia store pages
  composables/       # composable pages
  api/               # Nitro API route map and MCP tool map
  conventions/       # styling, testing, naming, gotchas
  types/             # global type definitions
```

## Page types

| Type | Location | When to create |
|------|----------|----------------|
| Overview | `wiki/overview.md` | One page, always updated |
| Architecture | `wiki/architecture/*.md` | Cross-cutting systems (auth, MCP, data flow) |
| Component | `wiki/components/*.md` | Any Vue component worth documenting |
| Store | `wiki/stores/*.md` | Pinia stores |
| Composable | `wiki/composables/*.md` | Each composable |
| API | `wiki/api/*.md` | Route maps, MCP tool inventory |
| Convention | `wiki/conventions/*.md` | Patterns, rules, gotchas |
| Type | `wiki/types/*.md` | Global type interfaces |

## Frontmatter

Every wiki page (except SCHEMA.md, index.md, log.md) uses:

```yaml
---
title: Short page title
type: overview | architecture | component | store | composable | api | convention | type
file: relative/path/to/source.ts  # omit for multi-file pages
updated: YYYY-MM-DD
---
```

## Cross-references

Link with standard markdown: `[ListsStore](../stores/lists.md)`. Liberal linking is good.

## Workflows

### Ingest a source
1. Read the file
2. Discuss key takeaways if needed
3. Update or create the relevant wiki page(s)
4. Update `index.md` if new pages added
5. Append to `log.md`

### Answer a query
1. Read `index.md` to find relevant pages
2. Read relevant pages
3. Synthesize answer with wiki citations
4. If the answer is valuable, file it as a new wiki page or update existing

### Lint (periodic health check)
Ask LLM to check for: contradictions, stale pages, orphan pages, missing cross-references, undocumented gotchas, data gaps.

## Sources

Raw sources are the codebase itself — files under `app/`, `server/`, `index.d.ts`, etc. Never modify source files from wiki operations.
