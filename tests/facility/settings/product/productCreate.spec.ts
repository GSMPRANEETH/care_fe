import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Product Create - Submit State", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/settings/product`);
  });

  test("Create disabled on empty form", async ({ page }) => {
    await page.getByRole("button", { name: /add product/i }).click();

    await expect(page.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  test("Create enabled after selecting product knowledge", async ({ page }) => {
    await page.getByRole("button", { name: /add product/i }).click();

    // Select product knowledge from dropdown/autocomplete
    await page.getByRole("combobox", { name: /product knowledge/i }).click();
    await page.getByRole("option").first().click();

    await expect(page.getByRole("button", { name: /create/i })).toBeEnabled();
  });
});
