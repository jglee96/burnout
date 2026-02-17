import { expect, test } from "@playwright/test";

test("dashboard renders and accepts a new task", async ({ page }) => {
  await page.goto("/app/day");

  await expect(
    page.getByRole("heading", { name: "Burnout Guard", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /Burnout Guard 시작하기|Get started with Burnout Guard|Burnout Guard を開始/
    })
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: /로컬 테스트 모드|Local test mode|ローカルテストモード/
    })
    .click();
  await expect(
    page.getByRole("heading", { name: /하루 시작|Start the day|勤務開始/ })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /하루 시작하기|Start day|勤務を開始/ })
    .click();

  await page
    .getByLabel(/작업 제목|Task title|タスク名/)
    .fill("Refine burnout evaluation copy");
  await page.getByRole("button", { name: /저장|Save Task|保存/ }).click();

  await expect(page.getByText("Refine burnout evaluation copy")).toBeVisible();
});
