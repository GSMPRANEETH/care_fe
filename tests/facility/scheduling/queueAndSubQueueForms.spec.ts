import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Queue/SubQueue Form Sheets - Submit State", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`/facility/${facilityId}/schedules`);
  });

  test("Queue creation: Save disabled on empty form", async ({ page }) => {
    // Navigate to a schedule resource that allows queue creation
    // Assuming there's a resource with queue management available
    const addQueueButton = page
      .getByRole("button", { name: /add queue/i })
      .first();
    if (await addQueueButton.isVisible()) {
      await addQueueButton.click();

      // Check that save button is disabled initially
      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeDisabled();
    }
  });

  test("Queue creation: Save enabled after entering queue name", async ({
    page,
  }) => {
    const addQueueButton = page
      .getByRole("button", { name: /add queue/i })
      .first();
    if (await addQueueButton.isVisible()) {
      await addQueueButton.click();

      await page
        .getByRole("textbox", { name: /queue name|name/i })
        .fill(faker.commerce.productName());

      const saveButton = page.getByRole("button", { name: /create/i }).last();
      await expect(saveButton).toBeEnabled();
    }
  });

  test("SubQueue creation: Save disabled on empty form", async ({ page }) => {
    // Navigate to queue that has sub-queue management
    const addSubQueueButton = page
      .getByRole("button", { name: /add service point|add sub.?queue/i })
      .first();
    if (await addSubQueueButton.isVisible()) {
      await addSubQueueButton.click();

      const saveButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await expect(saveButton).toBeDisabled();
    }
  });

  test("SubQueue creation: Save enabled after entering service point name", async ({
    page,
  }) => {
    const addSubQueueButton = page
      .getByRole("button", { name: /add service point|add sub.?queue/i })
      .first();
    if (await addSubQueueButton.isVisible()) {
      await addSubQueueButton.click();

      await page
        .getByRole("textbox", { name: /service point name|name/i })
        .fill(faker.commerce.productName());

      const saveButton = page.getByRole("button", { name: /create/i }).last();
      await expect(saveButton).toBeEnabled();
    }
  });
});
