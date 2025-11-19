import { expect, test } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";
test.describe("Invoice Creation", () => {
  let facilityId: string;
  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await page.goto(`facility/${facilityId}/billing/accounts`);
    await page.getByRole("button", { name: "Go to account" }).first().click();

    await page.getByRole("button", { name: "Invoice" }).click();
  });

  test("should not issue an empty inovice", async ({ page }) => {
    await page.getByRole("button", { name: "Create Invoice" }).first().click();

    await expect(
      page.getByRole("button", { name: "Issue Invoice" }),
    ).toBeDisabled();
  });

  test("should issue a valid invoice", async ({ page }) => {
    await page.getByRole("button", { name: "Add Charge Item" }).click();
    await page.getByText("Select charge item definition").click();
    await page.getByText("Tests").click();
    await page.getByText("Nothing").click();
    await page.getByRole("button", { name: "Add Items" }).click();
    await page.getByRole("button", { name: "Create Invoice" }).click();
    await page.getByRole("button", { name: "Issue Invoice" }).click();
    await expect(page.getByText("Issued")).toBeVisible();
  });
});
