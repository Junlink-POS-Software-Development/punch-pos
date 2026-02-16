# E2E Testing with Playwright

## Prerequisites

### 1. Environment Variables

Add these to your `.env.local`:

```env
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

> **Important:** The test user must be a real Supabase user with:
> - Role: `member`
> - Completed profile (first name, last name, job title)
> - Active subscription (status `PAID` with future end date)
>
> Otherwise middleware redirects will prevent tests from reaching protected pages.

### 2. Install Browsers

```bash
npx playwright install chromium
```

## Running Tests

### All tests (headless)
```bash
npm run test:e2e
```

### UI Mode (interactive — great for debugging)
```bash
npm run test:e2e:ui
```

### Debug Mode (step through with browser DevTools)
```bash
npx playwright test --debug
```

### Run a single test file
```bash
npx playwright test tests/core-flow.spec.ts
```

### Run with visible browser
```bash
npx playwright test --headed
```

## How It Works

### Authentication Strategy

Tests use **storage state** to avoid logging in before every test:

1. `tests/global.setup.ts` runs first — it logs in via the UI and saves cookies to `playwright/.auth/user.json`
2. All tests in the `authenticated` project automatically load these cookies
3. Each test starts already authenticated — no login overhead

### Project Structure

```
tests/
├── global.setup.ts     # Authenticates once, saves storage state
└── core-flow.spec.ts   # Main E2E test: home → dashboard → inventory

playwright/
└── .auth/
    └── user.json       # Saved auth state (gitignored)

playwright.config.ts    # Playwright configuration
```

### webServer

The config includes a `webServer` block that auto-starts `npm run dev` before tests run. If the dev server is already running on port 3000, it reuses it (except in CI where it always starts fresh).

## Viewing Test Reports

After a test run, view the HTML report:

```bash
npx playwright show-report
```

## Adding New Tests

1. Create a new `.spec.ts` file in the `tests/` directory
2. Tests automatically use the authenticated storage state
3. Use Playwright's [locator API](https://playwright.dev/docs/locators) for element selection
4. For tests that need a clean (unauthenticated) context, create a new browser context:

```ts
test("my unauthenticated test", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // ... test logic
  await context.close();
});
```

## CI Integration

The CI workflow includes an optional E2E job (commented out). To enable it:

1. Add `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` as GitHub repository secrets
2. Add Supabase env vars as secrets
3. Uncomment the `e2e` job in `.github/workflows/ci.yml`
