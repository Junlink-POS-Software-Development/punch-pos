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

    // Wait for the dashboard to load — the DashboardHeader contains "Punch POS"
    await expect(page.getByText("Punch POS")).toBeVisible({ timeout: 15_000 });

    // Verify the VitalsGrid section renders (contains stat cards)
    // The dashboard should have some content loaded
    await expect(page.locator(".min-h-screen")).toBeVisible();
  });

  test("authenticated user can navigate to inventory", async ({ page }) => {
    await page.goto("/inventory");

    // Should NOT redirect to /login
    await expect(page).not.toHaveURL(/\/login/);

    // The inventory page has a navigation bar with "register", "manage", "monitor" views
    // Wait for the inventory nav to render
    await expect(page.locator(".bg-card")).toBeVisible({ timeout: 15_000 });

    // Verify the page loaded (not stuck on loading state)
    await expect(page.getByText("Loading...")).not.toBeVisible({
      timeout: 10_000,
    });
  });

  test("unauthenticated access redirects to login", async ({ browser }) => {
    // Create a fresh context WITHOUT saved auth state
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("http://localhost:3000/dashboard");

    // Should be redirected to the login page
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    // Login form should be visible
    await expect(page.locator("h2")).toContainText("Sign In");

    await context.close();
  });
});
