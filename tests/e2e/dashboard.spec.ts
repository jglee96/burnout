import { expect, test } from "@playwright/test";

test("dashboard renders and accepts a new task", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Burnout Guard" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Burnout Guard 시작하기" })
  ).toBeVisible();

  await page.getByRole("button", { name: "로컬 테스트 모드" }).click();
  await expect(page.getByRole("heading", { name: "하루 시작" })).toBeVisible();

  await page.getByRole("button", { name: "하루 시작하기" }).click();

  await page.getByLabel("Task title").fill("Refine burnout evaluation copy");
  await page.getByRole("button", { name: "Save Task" }).click();

  await expect(page.getByText("Refine burnout evaluation copy")).toBeVisible();
});
