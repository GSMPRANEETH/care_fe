import { expect, test, type Page } from "@playwright/test";
import { expectToast } from "tests/helper/ui";
import { getAccountId } from "tests/support/accountId";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Invoice Creation", () => {
  let facilityId: string;
  let accountId: string;

  const createDraftInvoice = async (page: Page) => {
    await expect(
      page.getByRole("button", { name: /create invoice/i }),
    ).toBeVisible();

    await page.keyboard.press("i");
    await page.keyboard.press("Shift+Enter");

    expectToast(page, /invoice created successfully/i);
  };

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    accountId = getAccountId();

    await page.goto(`/facility/${facilityId}/billing/account/${accountId}`);
  });

  test("should create a draft invoice", async ({ page }) => {
    await test.step("Attempt to issue invoice with no items", async () => {
      await createDraftInvoice(page);
    });

    await test.step("Verify status is draft and 'issue invoice' button is disabled", async () => {
      await expect(page.getByText(/invoice: draft/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /issue invoice/i }),
      ).toBeDisabled();
    });
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
      // Select charge item category
      await page.getByRole("option", { name: /tests/i }).first().click();
      // Select specific charge item within category
      await page.getByRole("option", { name: /test/i }).first().click();

      await expect(
        page.getByRole("button", { name: /add items/i }),
      ).toBeEnabled();

      await page.keyboard.press("Enter");

      expectToast(page, /charge items added successfully/i);

      await expect(
        page.getByRole("button", { name: /add selected items/i }),
      ).toBeEnabled();

      await page.keyboard.press("Shift+Enter");
    });

    await test.step("Issue invoice", async () => {
      await expect(
        page.getByRole("button", { name: /issue invoice/i }),
      ).toBeEnabled();

      await page.keyboard.press("i");

      expectToast(page, /invoice updated successfully/i);
      await expect(page.getByText(/invoice: issued/i)).toBeVisible();
    });
  });
});
