import { faker } from "@faker-js/faker";
import { expect, test, type Page } from "@playwright/test";
import { CHARGE_ITEM_DEFINITIONS } from "tests/facility/settings/activityDefinition/activityDefinition";
import { expectToast } from "tests/helper/ui";
import { getAccountId } from "tests/support/accountId";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Invoice Creation", () => {
  let facilityId: string;
  let accountId: string;
  let randomChargeItem: string;

  const createDraftInvoice = async (page: Page) => {
    await expect(
      page.getByRole("button", { name: /create invoice/i }),
    ).toBeVisible();

    // Find all checked checkboxes and uncheck them
    const checkedCheckboxes = page.locator(
      'button[role="checkbox"][data-state="checked"]',
    );
    const count = await checkedCheckboxes.count();

    for (let i = 0; i < count; i++) {
      // Click to uncheck each checked checkbox
      await checkedCheckboxes.nth(0).click();
    }

    // Verify no checkboxes remain checked
    await expect(
      page.locator('button[role="checkbox"][data-state="checked"]'),
    ).toHaveCount(0);

    await page.keyboard.press("i");
    await page.keyboard.press("Shift+Enter");

    await expectToast(page, /invoice created successfully/i);
  };

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    accountId = getAccountId();
    randomChargeItem = faker.helpers.arrayElement(CHARGE_ITEM_DEFINITIONS);

    await page.goto(`/facility/${facilityId}/billing/account/${accountId}`);
  });

  test("should create a draft invoice", async ({ page }) => {
    await createDraftInvoice(page);

    await expect(page.getByText(/invoice: draft/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /issue invoice/i }),
    ).toBeDisabled();
  });

  test("should add charge items and issue invoice", async ({ page }) => {
    await createDraftInvoice(page);

    await test.step("Add charge items to invoice", async () => {
      await page.getByRole("button", { name: /add charge item A/i }).click();

      await expect(
        page.getByRole("button", { name: /other charge items/i }),
      ).toBeVisible();

      await page.keyboard.press("o");
      await page.getByRole("combobox").click();
      await page.getByRole("option", { name: /tests/i }).first().click();

      const escapedChargeItem = randomChargeItem.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      await page
        .getByRole("option", { name: new RegExp(escapedChargeItem, "i") })
        .first()
        .click();

      await expect(
        page.getByRole("button", { name: /add items/i }),
      ).toBeEnabled();
      await page.keyboard.press("Enter");
      await expectToast(page, /charge items added successfully/i);

      await expect(
        page.getByRole("button", { name: /add selected items/i }),
      ).toBeEnabled();
      await page.keyboard.press("Shift+Enter");
    });

    await test.step("Issue the invoice", async () => {
      await expect(
        page.getByRole("button", { name: /issue invoice/i }),
      ).toBeEnabled();
      await page.keyboard.press("i");

      await expectToast(page, /invoice updated successfully/i);
      await expect(page.getByText(/invoice: issued/i)).toBeVisible();
    });
  });
});
