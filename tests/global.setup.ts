import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

/**
 * Global setup: Authenticate a test user via the login UI and save
 * the resulting storage state (cookies + localStorage) so that all
 * subsequent tests start already authenticated.
 *
 * Required env vars in .env.local:
 *   TEST_USER_EMAIL
 *   TEST_USER_PASSWORD
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local"
    );
  }

  // 1. Navigate to the login page
  await page.goto("/login");
  await expect(page.locator("h2")).toContainText("Sign In", { timeout: 15_000 });

  // 2. Fill in credentials and submit
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();

  // 3. Wait for successful redirect away from /login
  //    After login, the app redirects to "/" (SalesTerminal)
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });

  // 4. Verify we are actually authenticated (not redirected back)
  const currentUrl = page.url();
  expect(currentUrl).not.toContain("/login");

  // 5. Save the authenticated storage state
  await page.context().storageState({ path: authFile });
});
