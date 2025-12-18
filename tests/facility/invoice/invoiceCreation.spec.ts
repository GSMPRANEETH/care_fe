import { expect, test } from "@playwright/test";
import { getAccountId } from "tests/support/accountId";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Invoice Creation", () => {
  let facilityId: string;
  let accountId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    accountId = getAccountId();

    await page.goto(`/facility/${facilityId}/billing/account/${accountId}`);
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
      await page.getByRole("button", { name: /add charge item/i }).click();

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

      await expect(
        page
          .locator("li[data-sonner-toast]")
          .getByText(/charge items added successfully/i),
      ).toBeVisible({ timeout: 10000 });

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

      await expect(
        page
          .locator("li[data-sonner-toast]")
          .getByText(/invoice updated successfully/i),
      ).toBeVisible({ timeout: 10000 });

      await expect(page.getByText(/invoice: issued/i)).toBeVisible();
    });
  });
});
