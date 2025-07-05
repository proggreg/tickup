# CI/CD Setup Guide

This guide explains how to set up automated testing for your TickUp project using GitHub Actions.

## Prerequisites

### 1. MongoDB URI Secret

Before the CI can run tests, you need to add your MongoDB connection string as a GitHub secret:

1. **Go to your repository Settings**
2. **Click "Secrets and variables" → "Actions"**
3. **Click "New repository secret"**
4. **Name:** `MONGODB_URI`
5. **Value:** Your MongoDB connection string (e.g., `mongodb://localhost:27017/tickup` or your Atlas URI)

**Important:** Use a test database, not your production database!

### 2. Test Database Setup

For CI testing, you should use:
- **Local MongoDB** for development
- **MongoDB Atlas** with a test cluster for CI
- **Docker MongoDB** for isolated testing

## Workflows Created

### 1. `test.yml` - Main Test Suite
- **Triggers:** Push to main/master, Pull Requests
- **Runs:** Unit tests, linting, and E2E tests against dev server
- **Features:** Single job execution, MongoDB connection, artifact upload

### 2. `playwright-dev.yml` - Alternative Dev Testing
- **Triggers:** Push to main/master, Pull Requests
- **Runs:** Playwright tests against dev server
- **Features:** Faster startup, dev environment testing

### 3. `pr-checks.yml` - Pull Request Specific
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
  - `test / Run All Tests`
  - `Pull Request Checks / Run Tests (Dev Mode)`

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
2. Dev server starts with MongoDB connection
3. E2E tests run against the dev server
4. Test results are uploaded as artifacts
5. Build status is reported to GitHub

### On Pull Request
1. All tests run in parallel
2. PR is blocked from merging until tests pass
3. Test results are commented on the PR
4. Detailed reports are available as artifacts

## Environment Variables

The workflows use these environment variables:

```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  OXC_PARSER_SKIP_NATIVE: true
  NODE_OPTIONS: "--max-old-space-size=4096 --no-warnings"
```

### Required Secrets
- **`MONGODB_URI`** - Your MongoDB connection string

### Optional Secrets (if needed)
- **`AUTH_SECRET`** - For authentication (if not using default)
- **`GITHUB_CLIENT_ID`** - For GitHub OAuth (if using)
- **`GITHUB_CLIENT_SECRET`** - For GitHub OAuth (if using)

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

## Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**
   - Check if MongoDB URI is set correctly
   - Ensure you're using the same Node.js version
   - Verify all dependencies are properly installed

2. **Dev server not starting**
   - Check if the port (3000) is available
   - Verify the `--host` flag is set in dev script
   - Check server logs for MongoDB connection errors

3. **MongoDB connection issues**
   - Verify the MongoDB URI secret is set
   - Check if the database is accessible from CI
   - Ensure the database has the required collections

4. **Playwright browsers not installing**
   - The workflow includes `--with-deps` flag
   - Check if you have sufficient disk space
   - Verify network connectivity

### Debugging

To debug CI issues:
1. Check the **Actions** tab for detailed logs
2. Download test artifacts to see screenshots/videos
3. Check server logs for startup issues
4. Verify MongoDB connection in the logs

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

1. **Add the MongoDB URI secret** as described above
2. **Push these workflow files** to your repository
3. **Set up branch protection rules** as described above
4. **Test the workflows** by creating a test PR
5. **Monitor the first few runs** to ensure everything works
6. **Customize** the workflows based on your specific needs

The workflows will automatically start running on your next push or pull request! 