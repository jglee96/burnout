import { expect, test } from "@playwright/test";

test("dashboard renders and accepts a new task", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Burnout Guard" })
  ).toBeVisible();

  await page.getByLabel("Task title").fill("Refine burnout evaluation copy");
  await page.getByRole("button", { name: "Save Task" }).click();

  await expect(page.getByText("Refine burnout evaluation copy")).toBeVisible();
});
