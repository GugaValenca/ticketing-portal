import { test, expect } from "@playwright/test";
import { E2E_USERNAME, E2E_PASSWORD, seedE2eDatabase } from "./fixtures";

test.beforeAll(() => {
  seedE2eDatabase();
});

test("forgot password sends a generic confirmation without revealing whether the email exists", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Username or Email").waitFor();

  await page.getByRole("button", { name: "Forgot Password?" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();

  await page.getByLabel("Email", { exact: true }).fill("someone-not-necessarily-real@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByText(/we've sent a link to reset the password/i)).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByLabel("Email", { exact: true })).not.toBeVisible();
});

test("unchecking remember me makes the session cookie expire with the browser", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByLabel("Username or Email").fill(E2E_USERNAME);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByLabel("Remember me").uncheck();
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("heading", { name: /dashboard/i }).waitFor();

  const cookies = await context.cookies();
  const refreshCookie = cookies.find((c) => c.name === "refresh_token");
  expect(refreshCookie?.expires).toBe(-1); // -1 = session cookie, no Max-Age
});

test("remember me checked keeps a persistent cookie", async ({ page, context }) => {
  await page.goto("/");
  await page.getByLabel("Username or Email").fill(E2E_USERNAME);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  // Checked by default, but be explicit.
  await page.getByLabel("Remember me").check();
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("heading", { name: /dashboard/i }).waitFor();

  const cookies = await context.cookies();
  const refreshCookie = cookies.find((c) => c.name === "refresh_token");
  expect(refreshCookie?.expires).toBeGreaterThan(0);
});
