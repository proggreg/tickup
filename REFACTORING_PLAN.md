# Refactoring & Cleanup Plan for TickUp

## Executive Summary

This document outlines comprehensive refactoring opportunities to improve code quality, maintainability, and consistency across the TickUp Nuxt application.

## 1. Type System Consolidation

### Issues
- Type definitions scattered between `index.d.ts` and schema files
- Duplicate type definitions (e.g., `ListType` defined in both places)
- Schema types don't always match TypeScript interfaces

### Recommendations
1. **Centralize types**: Create a `types/` directory structure:
   ```
   types/
     - index.ts          # Export all types
     - todo.ts           # Todo-related types
     - list.ts           # List-related types
     - user.ts           # User-related types
     - api.ts            # API response types
   ```

2. **Align schemas with types**: Ensure Mongoose schemas use TypeScript interfaces
3. **Remove duplication**: Eliminate duplicate `ListType` definitions

### Priority: HIGH

---

## 2. Logging & Error Handling

### Issues
- 71 instances of `console.log/warn/error` throughout codebase
- No centralized logging utility
- Inconsistent error handling patterns
- Some errors are swallowed silently

### Recommendations
1. **Create a logging utility** (`utils/logger.ts`):
   ```typescript
   export const logger = {
     log: (...args: any[]) => {
       if (import.meta.dev) console.log(...args)
     },
     warn: (...args: any[]) => {
       console.warn(...args)
       // Could integrate with Bugsnag
     },
     error: (error: Error | unknown, context?: string) => {
       console.error(context, error)
       // Send to Bugsnag in production
     }
   }
   ```

2. **Standardize error handling**:
   - Create API error utilities
   - Use consistent try-catch patterns
   - Return proper error responses

3. **Remove debug console.logs**: Especially in production paths

### Priority: MEDIUM

---

## 3. Code Duplication - Todo List Components

### Issues
- `OverDue.vue`, `Today.vue`, and `TodayClosed.vue` share similar structure
- Repeated empty state logic
- Similar todo item rendering

### Recommendations
1. **Create a reusable `TodoList` component**:
   ```vue
   <TodoList
     :todos="filteredTodos"
     :empty-state="true"
     :status-filter="status"
     @todo-click="handleClick"
     @todo-status-change="handleStatusChange"
   />
   ```

2. **Extract common logic** into composables:
   - `useTodoActions.ts` - handle select, toggle status, etc.
   - `useTodoFilters.ts` - filtering logic

3. **Consolidate empty state**: Use single `AppEmptyState` consistently

### Priority: HIGH

---

## 4. Store Refactoring

### Issues
- `lists.ts` store is 306 lines with multiple responsibilities
- Mixed concerns: state management, API calls, business logic
- Some actions are too complex

### Recommendations
1. **Split store into focused stores**:
   ```
   stores/
     - lists.ts          # List CRUD operations
     - todos.ts          # Todo CRUD operations
     - ui.ts             # UI state (view, current selections)
   ```

2. **Extract API logic** to services:
   ```
   services/
     - listService.ts    # List API calls
     - todoService.ts    # Todo API calls
   ```

3. **Simplify actions**: Break down complex actions into smaller, testable functions

### Priority: HIGH

---

## 5. User ID Handling

### Issues
- Inconsistent user ID extraction: checking both `.id` and `.sub`
- Logic repeated across multiple files

### Recommendations
1. **Create composable** (`composables/useCurrentUser.ts`):
   ```typescript
   export const useCurrentUser = () => {
     const { data } = useAuth()
     const userId = computed(() => 
       data.value?.user?.id || data.value?.user?.sub || ''
     )
     return { userId, user: computed(() => data.value?.user) }
   }
   ```

2. **Replace all instances** of user ID extraction with this composable

### Priority: MEDIUM

---

## 6. API Pattern Consistency

### Issues
- Mixed use of `$fetch` and `useFetch`
- Inconsistent error handling
- No API client abstraction

### Recommendations
1. **Create API client utility** (`utils/apiClient.ts`):
   ```typescript
   export const apiClient = {
     get: <T>(url: string, options?) => $fetch<T>(url, { method: 'GET', ...options }),
     post: <T>(url: string, body?, options?) => $fetch<T>(url, { method: 'POST', body, ...options }),
     put: <T>(url: string, body?, options?) => $fetch<T>(url, { method: 'PUT', body, ...options }),
     delete: <T>(url: string, options?) => $fetch<T>(url, { method: 'DELETE', ...options }),
   }
   ```

2. **Standardize when to use `useFetch` vs `$fetch`**:
   - Use `useFetch` for reactive data that needs SSR/hydration
   - Use `$fetch`/API client for mutations and manual calls

### Priority: MEDIUM

---

## 7. Configuration Cleanup

### Issues
- Auth origin configuration duplicated (4+ places in `nuxt.config.ts`)
- Large commented-out PWA configuration block (100+ lines)

### Recommendations
1. **Extract environment config**:
   ```typescript
   // config/env.ts
   export const getAuthOrigin = () => 
     process.env.AUTH_ORIGIN || 
     (process.env.NODE_ENV === 'production' 
       ? 'https://tickup.gregfield.dev/api/auth' 
       : 'http://localhost:3000')
   ```

2. **Remove or organize commented code**:
   - Delete if not needed
   - Move to separate file if planning to use
   - Add TODO comments with reason if temporarily disabled

### Priority: LOW

---

## 8. Component Organization

### Issues
- Large component files
- Business logic mixed with presentation
- Some components do too much

### Recommendations
1. **Extract composables** from components:
   - Move data fetching to composables
   - Extract form logic to composables
   - Isolate business logic

2. **Component composition**: Break large components into smaller ones

3. **Consistent naming**: Ensure component names follow Vue conventions

### Priority: MEDIUM

---

## 9. Server API Improvements

### Issues
- Inconsistent error handling
- Some endpoints don't validate input
- Mixed response patterns

### Recommendations
1. **Create API middleware** for:
   - Input validation (using Zod or similar)
   - Consistent error formatting
   - Authentication checks

2. **Standardize responses**:
   ```typescript
   // Success
   return { success: true, data: result }
   
   // Error
   throw createError({ statusCode: 400, message: 'Invalid input' })
   ```

3. **Add request validation** to all endpoints

### Priority: MEDIUM

---

## 10. Testing Infrastructure

### Issues
- Limited test coverage
- E2E tests exist but unit tests are sparse

### Recommendations
1. **Add unit tests** for:
   - Composables
   - Store actions
   - Utility functions

2. **Improve test organization**: Match test structure to source structure

### Priority: LOW (if tests are working)

---

## 11. Dead Code Removal

### Issues
- Commented-out PWA code
- Possibly unused components/files

### Recommendations
1. **Audit and remove**:
   - Unused components
   - Commented code
   - Unused dependencies

2. **Use tools**:
   - ESLint unused imports/variables rules
   - Dependency analysis tools

### Priority: LOW

---

## Implementation Priority

### Phase 1 (High Impact, Low Risk)
1. ✅ Create `useCurrentUser` composable
2. ✅ Consolidate todo list components
3. ✅ Extract logging utility
4. ✅ Remove console statements

### Phase 2 (High Impact, Medium Risk)
1. Split stores
2. Create API services
3. Type system consolidation
4. API client utility

### Phase 3 (Medium Impact)
1. Server API improvements
2. Component refactoring
3. Configuration cleanup
4. Dead code removal

---

## Metrics to Track

- Lines of code reduction
- Component reuse percentage
- Type coverage
- Test coverage
- Bundle size impact

---

## Notes

- Incremental refactoring: Don't break existing functionality
- Test after each change
- Update documentation as you go
- Consider creating feature branches for larger refactors

