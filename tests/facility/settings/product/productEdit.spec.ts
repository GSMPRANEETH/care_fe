import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Product Edit", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/settings/product`);
  });

  test("should keep Update disabled when no changes", async ({ page }) => {
    await page.getByRole("link", { name: /view/i }).first().click();
    await page.getByRole("button", { name: /edit/i }).click();

    await expect(page.getByRole("button", { name: /update/i })).toBeDisabled();
  });

  test("should enable Update when form is modified", async ({ page }) => {
    await page.getByRole("link", { name: /view/i }).first().click();
    await page.getByRole("button", { name: /edit/i }).click();

    await page.getByLabel(/status/i).click();
    await page.getByRole("option", { name: /inactive/i }).click();

    await expect(page.getByRole("button", { name: /update/i })).toBeEnabled();
  });

  test("should update product status and revert", async ({ page }) => {
    await page.getByRole("link", { name: /view/i }).first().click();

    await page.getByRole("button", { name: /edit/i }).click();

    await page.getByLabel(/status/i).click();
    await page.getByRole("option", { name: /inactive/i }).click();
    await page.getByRole("button", { name: /update/i }).click();

    await expect(page).toHaveURL(/\/settings\/product\/[0-9a-fA-F-]{36}$/);

    await expect(page.getByText("Back to list")).toBeVisible();

    // Revert status to active as part of cleanup
    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByLabel(/status/i).click();
    await page.getByRole("option", { name: /active/i, exact: true }).click();
    await page.getByRole("button", { name: /update/i }).click();

    await expect(page.getByText("Product updated successfully")).toBeVisible();
  });
});
