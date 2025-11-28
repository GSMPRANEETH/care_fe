import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";
test.use({ storageState: "tests/.auth/user.json" });

test.describe("Invoice Creation", () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "tests/.auth/user.json",
    });
    const page = await context.newPage();

    const facilityId = getFacilityId();
    const accName = faker.word.words(1);

    await page.goto(`/facility/${facilityId}/encounters/patients/all`);

    await page
      .getByRole("link", { name: /patient home/i })
      .first()
      .click();

    await page
      .locator("[data-slot='patient-info-hover-card-trigger']")
      .last()
      .click();

    await page.getByRole("link", { name: /view profile/i }).click();
    await page.getByRole("tab", { name: /accounts/i }).click();
    await page.getByRole("button", { name: /create account/i }).click();

    await page.getByRole("textbox", { name: /name/i }).fill(accName);

    await expect(page.getByRole("button", { name: /create/i })).toBeEnabled();

    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(accName)).toBeVisible({ timeout: 10000 });

    await page.close();
  });
  test.beforeEach(async ({ page }) => {
    const facilityId = getFacilityId();

    await page.goto(`/facility/${facilityId}/billing/accounts`);

    await page
      .getByRole("button", { name: /go to account/i })
      .first()
      .click();

    await expect(
      page.getByRole("button", { name: /create invoice/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.keyboard.press("i");
  });

  test("should not issue an empty invoice", async ({ page }) => {
    await page.keyboard.press("Shift+Enter");

    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/invoice created successfully/i),
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole("button", { name: /issue invoice/i }),
    ).toBeDisabled();
  });

  test("should issue a valid invoice", async ({ page }) => {
    await page.keyboard.press("a");

    await page.getByText(/select charge item definition/i).click();

    await page.getByRole("option", { name: /tests/i }).first().click();
    await page.getByRole("option", { name: /test/i }).first().click();

    await expect(
      page.getByRole("button", { name: /add items/i }),
    ).toBeEnabled();

    await page.keyboard.press("Enter");

    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/charge items added successfully/i),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("button", { name: /create invoice/i }),
    ).toBeEnabled();

    await page.keyboard.press("Shift+Enter");

    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/invoice created successfully/i),
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole("button", { name: /issue invoice/i }),
    ).toBeEnabled();

    await page.keyboard.press("i");

    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/invoice updated successfully/i),
    ).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/issued/i)).toBeVisible();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    const facilityId = getFacilityId();

    await page.goto(`/facility/${facilityId}/encounters/patients/all`);

    await page
      .getByRole("button", { name: /view encounter/i })
      .first()
      .click();

    await page
      .locator("[data-slot='patient-info-hover-card-trigger']")
      .last()
      .click();

    await page.getByRole("link", { name: /view profile/i }).click();
    await page.getByRole("tab", { name: /accounts/i }).click();

    await page
      .getByRole("button", { name: /go to account/i })
      .first()
      .click();

    await expect(
      page.getByRole("button", { name: /settle & close/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.keyboard.press("s");

    await page.getByRole("button", { name: /close account/i }).click();

    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/account closed successfully/i),
    ).toBeVisible({ timeout: 10000 });

    await page.close();
  });
});
