import { test, expect } from "@playwright/test";
import { E2E_USERNAME, E2E_PASSWORD, seedE2eDatabase } from "./fixtures";

test.beforeAll(() => {
  seedE2eDatabase();
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username or Email").fill(E2E_USERNAME);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("heading", { name: /dashboard/i }).waitFor();
});

test("Escape closes the modal and returns focus to the trigger", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "New ticket" });
  await trigger.click();
  await expect(page.getByLabel("Title")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByLabel("Title")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("background does not scroll while the modal is open", async ({ page }) => {
  await page.getByRole("button", { name: "New ticket" }).click();
  await expect(page.getByLabel("Title")).toBeVisible();

  const overflow = await page.evaluate(() => document.body.style.overflow);
  expect(overflow).toBe("hidden");
});
