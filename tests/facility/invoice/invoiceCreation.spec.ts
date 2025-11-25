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

    await page.goto(`/facility/${facilityId}/encounters/patients/all`);
    await page.getByRole("button", { name: "View Encounter" }).first().click();
    await page.getByRole("button", { name: "Male" }).click();
    await page.getByRole("link", { name: "View Profile" }).click();
    await page.getByRole("tab", { name: "Accounts" }).click();
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.getByLabel("Name").fill("Test Account");
    await page.getByRole("button", { name: "Create" }).click();

    await context.close();
  });
  test.beforeEach(async ({ page }) => {
    const facilityId = getFacilityId();

    await page.goto(`/facility/${facilityId}/billing/accounts`);
    await page.getByRole("button", { name: "Go to account" }).first().click();
    await page.getByRole("button", { name: "Invoice" }).click();
  });

  test("should not issue an empty invoice", async ({ page }) => {
    await page.getByRole("button", { name: "Create Invoice" }).first().click();

    await expect(
      page.getByRole("button", { name: "Issue Invoice" }),
    ).toBeDisabled();
  });

  test("should issue a valid invoice", async ({ page }) => {
    await page.getByRole("button", { name: "Add Charge Item" }).click();
    await page.getByText("Select charge item definition").click();
    await page.getByRole("option").first().click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Add Items" }).click();
    await page.getByRole("button", { name: "Create Invoice" }).click();
    await page.getByRole("button", { name: "Issue Invoice" }).click();

    await expect(page.getByText("Issued")).toBeVisible();
  });
});
