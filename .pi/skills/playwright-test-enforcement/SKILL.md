---
name: playwright-test-enforcement
description: Ensures that every new feature implementation includes a corresponding Playwright end-to-end test. Use this skill when implementing any new feature, UI component, or user-facing functionality.
---

# Playwright Test Enforcement

This skill ensures that all new features are properly tested with Playwright end-to-end tests.

## When to Use

Activate this skill whenever:
- Implementing a new feature
- Adding a new UI component
- Creating new user-facing functionality
- Modifying existing features that lack tests

## Requirements

Before implementing any feature, you MUST:

1. **Identify the feature scope**: Understand what user interactions and outcomes need testing
2. **Create the Playwright test FIRST or alongside the feature**: Don't wait until after
3. **Ensure the test covers**:
   - User interactions (clicks, typing, navigation)
   - Expected outcomes (UI changes, data updates, navigation results)
   - Edge cases and error states
   - Accessibility considerations where applicable

## Test Structure

Place Playwright tests in the `e2e/` directory, organized by feature area:
- `e2e/app/` - Application-level features
- `e2e/auth/` - Authentication flows
- `e2e/lists/` - List management features
- `e2e/todos/` - Todo-related features
- Create new subdirectories as needed for new feature areas

### Test Template

Use this template as a starting point, following the project's conventions:

```typescript
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('a user can [perform specific action]', () => {
  test('[specific scenario description]', async ({ page, isMobile }) => {
    // Skip if not applicable to mobile/desktop
    // test.skip(isMobile, 'This feature is desktop only');
    
    // Navigate to the feature
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check authentication if needed
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error('Not authenticated - redirected to login page');
    }
    
    // Perform user actions
    const actionButton = await page.getByTestId('action-button');
    await actionButton.click();
    
    // Generate unique test data if needed
    const testId = uuidv4();
    const testName = `Test ${testId}`;
    
    // Wait for API calls if applicable
    const requestPromise = page.waitForRequest(request =>
      request.url().includes('/api/endpoint') && request.method() === 'POST',
    );
    
    // Complete the action
    await page.keyboard.press('Enter');
    await requestPromise;
    
    // Assert expected outcomes
    const resultElement = await page.getByTestId('result');
    expect(resultElement).not.toBeHidden();
  });

  test('handles error case gracefully', async ({ page }) => {
    // Test error scenarios
  });
});
```

## Implementation Workflow

When asked to implement a feature, follow this workflow:

1. **Analyze the feature**: Break down user flows and interactions
2. **Write the test specification**: Define what will be tested
3. **Implement the test**: Create the Playwright test file
4. **Implement the feature**: Build the feature to pass the test (TDD approach)
5. **Verify the test passes**: Run the test and confirm it works
6. **Document test coverage**: Note what aspects are covered

## Checklist

Before considering a feature complete, verify:

- [ ] Playwright test file created
- [ ] Test covers primary user flow
- [ ] Test covers at least one error/edge case
- [ ] Test uses proper selectors (prefer data-testid)
- [ ] Test assertions are meaningful and specific
- [ ] Test runs successfully
- [ ] Test is documented (either in code comments or in PR/commit message)

## Running Tests

Remind the user to run tests with:

```bash
npx playwright test                    # Run all tests
npx playwright test path/to/test.spec.ts  # Run specific test
npx playwright test --ui               # Run in UI mode
npx playwright test --debug            # Run in debug mode
```

## Best Practices

- Use `getByTestId()` and `data-test-id` attributes for reliable element selection
- Keep tests focused on user behavior, not implementation details
- Write descriptive test names that explain the behavior being tested
- Group related tests using `test.describe()` with user-centric descriptions
- Use `uuid` to generate unique test data (avoid test interference)
- Wait for `networkidle` state after navigation
- Use `waitForRequest()` to confirm API calls complete
- Handle authentication states explicitly (check for login redirects)
- Use `test.skip()` for mobile/desktop-specific features
- Prefer `getByRole()` and semantic selectors when appropriate
- Test the happy path AND error scenarios
- Use `expect().not.toBeHidden()` instead of `.toBeVisible()` when checking presence

## Enforcement

If a feature implementation is requested WITHOUT a test:
1. **Politely remind** the user that a Playwright test is required
2. **Ask** if they want you to create the test first, alongside, or after the feature
3. **Create the test** as part of the same work session
4. **Do not mark the feature as complete** until the test exists

This is non-negotiable for maintaining code quality and preventing regressions.
