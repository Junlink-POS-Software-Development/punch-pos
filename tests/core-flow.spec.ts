import { test, expect } from "@playwright/test";

test.describe("Core Application Flow", () => {
  test("authenticated user can access the home page (POS Terminal)", async ({
    page,
  }) => {
    // Navigate to the home page — should NOT redirect to /login
    await page.goto("/");

    // The middleware should allow access; verify we are not on /login
    await expect(page).not.toHaveURL(/\/login/);

    // The home page renders the SalesTerminal inside MainWindow
    // Verify the main layout shell is present
    await expect(page.locator("body")).toBeVisible();

    // Verify we are on the root URL (not redirected to onboarding, etc.)
    expect(page.url()).toMatch(/localhost:3000\/?$/);
  });

  test("authenticated user can navigate to the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should NOT redirect to /login
    await expect(page).not.toHaveURL(/\/login/);

    // Wait for the dashboard to load — the DashboardHeader renders "Overview"
    await expect(
      page.getByRole("heading", { name: "Overview", level: 1 })
    ).toBeVisible({
      timeout: 15_000,
    });

    // Verify the date filter input is present (part of DashboardHeader)
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test("authenticated user can navigate to inventory", async ({ page }) => {
    await page.goto("/inventory");

    // Should NOT redirect to /login or /onboarding
    await expect(page).toHaveURL(/\/inventory/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/onboarding/);

    // Wait for the inventory navigation to render
    await expect(page.getByRole("navigation")).toBeVisible({ timeout: 15_000 });
    
    // Verify specific navigation items are present
    await expect(page.getByText("Register Item")).toBeVisible();

    // Verify the page loaded (not stuck on loading state)
    await expect(page.getByText("Loading...")).not.toBeVisible({
      timeout: 10_000,
    });
  });

  test("unauthenticated access redirects to login", async ({ browser }) => {
    // Create a fresh context with explicitly EMPTY storage state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("http://localhost:3000/dashboard");

    // Should be redirected to the login page
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    // Login form should be visible
    await expect(
      page.getByRole("heading", { name: "Sign In" })
    ).toBeVisible();

    await context.close();
  });
});
