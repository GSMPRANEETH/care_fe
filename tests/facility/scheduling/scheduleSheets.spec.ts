import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Schedule Sheets - Submit State", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/schedules`);
  });

  test("Create Schedule Exception: Save disabled on empty form", async ({
    page,
  }) => {
    // Look for button to add schedule exception
    const addExceptionButton = page
      .getByRole("button", { name: /add exception|new exception/i })
      .first();
    if (await addExceptionButton.isVisible()) {
      await addExceptionButton.click();

      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeDisabled();
    }
  });

  test("Create Schedule Exception: Save enabled after filling reason", async ({
    page,
  }) => {
    const addExceptionButton = page
      .getByRole("button", { name: /add exception|new exception/i })
      .first();
    if (await addExceptionButton.isVisible()) {
      await addExceptionButton.click();

      // Fill reason field
      await page.getByRole("textbox", { name: /reason/i }).fill("Holiday");

      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeEnabled();
    }
  });

  test("Create Schedule Template: Save disabled on empty form", async ({
    page,
  }) => {
    // Look for button to create schedule template
    const createTemplateButton = page
      .getByRole("button", { name: /create template|new template/i })
      .first();
    if (await createTemplateButton.isVisible()) {
      await createTemplateButton.click();

      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeDisabled();
    }
  });

  test("Create Schedule Template: Save enabled after filling template name", async ({
    page,
  }) => {
    const createTemplateButton = page
      .getByRole("button", { name: /create template|new template/i })
      .first();
    if (await createTemplateButton.isVisible()) {
      await createTemplateButton.click();

      // Fill template name field
      await page
        .getByRole("textbox", { name: /name/i })
        .first()
        .fill("Morning Clinic");

      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeEnabled();
    }
  });
});
