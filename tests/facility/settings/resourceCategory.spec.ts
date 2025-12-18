import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Resource Category - Submit State", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/settings/resources`);
  });

  test("Create disabled on empty form", async ({ page }) => {
    await page.getByRole("button", { name: /add category/i }).click();

    await expect(page.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  test("Create enabled after entering title", async ({ page }) => {
    await page.getByRole("button", { name: /add category/i }).click();

    await page
      .getByRole("textbox", { name: /title/i })
      .fill(faker.commerce.department());

    await expect(page.getByRole("button", { name: /create/i })).toBeEnabled();
  });

  test("Save disabled on edit when no changes", async ({ page }) => {
    // Open first resource category if it exists
    const firstEditButton = page.getByRole("button", { name: /edit/i }).first();
    if (await firstEditButton.isVisible()) {
      await firstEditButton.click();

      await expect(
        page.getByRole("button", { name: /save|create/i }),
      ).toBeDisabled();
    }
  });

  test("Save enabled on edit after modifying title", async ({ page }) => {
    // Open first resource category if it exists
    const firstEditButton = page.getByRole("button", { name: /edit/i }).first();
    if (await firstEditButton.isVisible()) {
      await firstEditButton.click();

      const titleField = page.getByRole("textbox", { name: /title/i });
      const currentValue = await titleField.inputValue();
      await titleField.fill(currentValue + " X");

      await expect(page.getByRole("button", { name: /save/i })).toBeEnabled();
    }
  });
});
