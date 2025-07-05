# CI/CD Setup Guide

This guide explains how to set up automated testing for your TickUp project using GitHub Actions.

## Workflows Created

### 1. `test.yml` - Comprehensive Test Suite
- **Triggers:** Push to main/master, Pull Requests
- **Runs:** Unit tests, linting, and E2E tests
- **Features:** Parallel execution, caching, artifact upload

### 2. `playwright.yml` - Playwright Tests (Production Build)
- **Triggers:** Push to main/master, Pull Requests  
- **Runs:** Playwright tests against built application
- **Features:** Builds the app, runs tests, uploads results

### 3. `playwright-dev.yml` - Playwright Tests (Dev Server)
- **Triggers:** Push to main/master, Pull Requests
- **Runs:** Playwright tests against dev server
- **Features:** Faster startup, dev environment testing

### 4. `pr-checks.yml` - Pull Request Specific
- **Triggers:** Pull Requests only
- **Runs:** All tests + PR comments with results
- **Features:** Automatic PR comments with test status

## Setting Up Branch Protection Rules

To ensure tests must pass before merging:

### 1. Go to Repository Settings
- Navigate to your repository on GitHub
- Click **Settings** tab
- Click **Branches** in the left sidebar

### 2. Add Branch Protection Rule
- Click **Add rule** or **Add branch protection rule**
- In **Branch name pattern**, enter: `main` (or `master`)
- Check the following options:

#### Required Status Checks
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- In the search box, find and select:
  - `test / Unit Tests`
  - `test / E2E Tests`
  - `Pull Request Checks / Run Tests`

#### Additional Settings (Recommended)
- ✅ **Require pull request reviews before merging**
- ✅ **Require review from code owners**
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Restrict pushes that create files larger than 100 MB**

### 3. Save the Rule
- Click **Create** or **Save changes**

## How It Works

### On Push to Main/Master
1. Unit tests run first
2. If unit tests pass, E2E tests run
3. Test results are uploaded as artifacts
4. Build status is reported to GitHub

### On Pull Request
1. All tests run in parallel
2. PR is blocked from merging until tests pass
3. Test results are commented on the PR
4. Detailed reports are available as artifacts

## Test Artifacts

After each test run, you can download:
- **Playwright Report:** HTML report with screenshots and videos
- **Test Results:** Raw test output and logs
- **Videos:** Recorded test runs (if enabled)

### Accessing Artifacts
1. Go to the **Actions** tab in your repository
2. Click on a specific workflow run
3. Scroll down to **Artifacts**
4. Download the `playwright-report` artifact
5. Extract and open `index.html` in your browser

## Environment Variables

If your tests require environment variables (like database connections), add them in:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets for sensitive data
3. Update the workflow files to use them:

```yaml
- name: Run tests with env vars
  run: pnpm exec playwright test
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
```

## Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**
   - Check if you're using the same Node.js version
   - Ensure all dependencies are properly installed
   - Verify environment variables are set

2. **Dev server not starting**
   - Check if the port (3000) is available
   - Verify the `--host` flag is set in dev script
   - Increase the timeout in the workflow

3. **Playwright browsers not installing**
   - The workflow includes `--with-deps` flag
   - Check if you have sufficient disk space
   - Verify network connectivity

### Debugging

To debug CI issues:
1. Check the **Actions** tab for detailed logs
2. Download test artifacts to see screenshots/videos
3. Add debug steps to workflows:

```yaml
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "pnpm version: $(pnpm --version)"
    echo "Current directory: $(pwd)"
    echo "Files in directory: $(ls -la)"
```

## Customization

### Running Specific Tests
To run only certain test files:

```yaml
- name: Run specific tests
  run: pnpm exec playwright test e2e/user-journey-login-create-list.spec.ts
```

### Adding More Browsers
To test against multiple browsers:

```yaml
- name: Run tests on multiple browsers
  run: pnpm exec playwright test --project=chromium --project=firefox --project=webkit
```

### Parallel Test Execution
To run tests in parallel:

```yaml
- name: Run tests in parallel
  run: pnpm exec playwright test --workers=4
```

## Next Steps

1. **Push these workflow files** to your repository
2. **Set up branch protection rules** as described above
3. **Test the workflows** by creating a test PR
4. **Monitor the first few runs** to ensure everything works
5. **Customize** the workflows based on your specific needs

The workflows will automatically start running on your next push or pull request! 