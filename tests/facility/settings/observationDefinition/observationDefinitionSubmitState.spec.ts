import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

// Use the authenticated state
test.use({ storageState: "tests/.auth/user.json" });

test.describe("Observation Definition Submit State", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/settings/observation_definitions`);
  });

  test("Create: Save disabled on empty form", async ({ page }) => {
    await page
      .getByRole("button", { name: /add observation definition/i })
      .click();

    await expect(
      page.getByRole("button", { name: /create|save/i }),
    ).toBeDisabled();
  });

  test("Create: Save enabled after touching a required field", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /add observation definition/i })
      .click();

    await page.getByRole("textbox", { name: /title/i }).fill("Hemoglobin");

    await expect(
      page.getByRole("button", { name: /create|save/i }),
    ).toBeEnabled();
  });

  test("Edit: Save disabled until modified", async ({ page }) => {
    // Create minimal observation to edit
    await page
      .getByRole("button", { name: /add observation definition/i })
      .click();
    await page.getByRole("textbox", { name: /title/i }).fill("BP Systolic");
    await page.getByRole("textbox", { name: /slug/i }).fill("bp-systolic");
    await page
      .getByRole("textbox", { name: /description/i })
      .fill("Systolic blood pressure");
    await page.getByRole("combobox", { name: /status/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox", { name: /data type/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /create/i }).click();

    // Open edit page of the first item
    await page.getByRole("link", { name: /edit/i }).first().click();

    await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  test("Edit: Save enabled after modifying title", async ({ page }) => {
    // Create minimal observation to edit
    await page
      .getByRole("button", { name: /add observation definition/i })
      .click();
    await page.getByRole("textbox", { name: /title/i }).fill("BP Diastolic");
    await page.getByRole("textbox", { name: /slug/i }).fill("bp-diastolic");
    await page
      .getByRole("textbox", { name: /description/i })
      .fill("Diastolic blood pressure");
    await page.getByRole("combobox", { name: /status/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox", { name: /data type/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /create/i }).click();

    // Open edit page and modify Title
    await page.getByRole("link", { name: /edit/i }).first().click();
    await page.getByRole("textbox", { name: /title/i }).fill("BP Diastolic X");

    await expect(page.getByRole("button", { name: /save/i })).toBeEnabled();
  });
});
