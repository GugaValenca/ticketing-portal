import { test, expect } from "@playwright/test";
import { E2E_USERNAME, E2E_PASSWORD, seedE2eDatabase } from "./fixtures";

test.beforeAll(() => {
  seedE2eDatabase();
});

test("a user can log in, create a ticket, see it in the list, and sign out", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username or Email").fill(E2E_USERNAME);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "LOGIN" }).click();

  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

  const ticketTitle = `E2E smoke test ticket ${Date.now()}`;
  await page.getByRole("button", { name: "New ticket" }).click();
  await page.getByLabel("Title").fill(ticketTitle);
  await page.getByRole("button", { name: "Create ticket" }).click();

  await expect(page.getByRole("heading", { name: ticketTitle })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Username or Email")).toBeVisible();
});
