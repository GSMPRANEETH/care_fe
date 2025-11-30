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
    await context.close();
  });
  test.beforeEach(async ({ page }) => {
    const facilityId = getFacilityId();

    await page.goto(`/facility/${facilityId}/billing/accounts`);

    await page
      .getByRole("button", { name: /go to account/i })
      .first()
      .click();
  });

  test("should create a draft invoice", async ({ page }) => {
    await test.step("Attempt to issue invoice with no items", async () => {
      await expect(
        page.getByRole("button", { name: /create invoice/i }),
      ).toBeVisible({ timeout: 10000 });
      await page.keyboard.press("i");
      await page.keyboard.press("Shift+Enter");
    });
    await test.step("Verify invoice created toast appears", async () => {
      await expect(
        page
          .locator("li[data-sonner-toast]")
          .getByText(/invoice created successfully/i),
      ).toBeVisible({ timeout: 10000 });
    });
    await test.step("Verify status is draft and 'issue invoice' button is disabled", async () => {
      await expect(page.getByText(/invoice: draft/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /issue invoice/i }),
      ).toBeDisabled();
    });
  });
  test("should add charge items and issue invoice", async ({ page }) => {
    await page.getByRole("link", { name: /see invoice/i }).click();
    await test.step("Add charge items to invoice", async () => {
      await expect(
        page.getByRole("button", { name: /add charge item/i }),
      ).toBeVisible();
      await page.keyboard.press("a");
      await expect(
        page.getByRole("button", { name: /other charge items/i }),
      ).toBeVisible();
      await page.keyboard.press("o");
      await page.getByRole("combobox").click();
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
        await page.getByRole("button", { name: /add selected items/i }),
      ).toBeEnabled();
      await page.keyboard.press("Shift+Enter");
    });
    await test.step("Issue invoice", async () => {
      await expect(
        page.getByRole("button", { name: /issue invoice/i }),
      ).toBeEnabled();
      await page.keyboard.press("i");
      await expect(
        page
          .locator("li[data-sonner-toast]")
          .getByText(/invoice updated successfully/i),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/invoice: issued/i)).toBeVisible();
    });
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "tests/.auth/user.json",
    });
    const page = await context.newPage();
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
    await context.close();
  });
});
