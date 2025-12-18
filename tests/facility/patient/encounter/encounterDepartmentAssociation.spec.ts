import { expect, test, type Page } from "@playwright/test";
import { format, subDays } from "date-fns";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("Manage departments/teams association to an encounter", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    const createdDateAfter = format(subDays(new Date(), 90), "yyyy-MM-dd");
    const createdDateBefore = format(new Date(), "yyyy-MM-dd");
    await page.goto(
      `/facility/${facilityId}/encounters/patients/all?created_date_after=${createdDateAfter}&created_date_before=${createdDateBefore}&status=in_progress`,
    );
    await page.getByText("View Encounter").first().click();
    await openDepartmentsDialog(page);
  });

  async function openDepartmentsDialog(page: Page) {
    await page.getByRole("tab", { name: /actions/i }).click();
    await page.getByRole("button", { name: /update department/i }).click();
  }

  async function deleteOrganization(page: Page) {
    await page
      .locator("button")
      .filter({ has: page.locator(".lucide-trash-2") })
      .first()
      .click();
  }

  async function verifyDeleteSuccess(page: Page) {
    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/organization removed successfully/i),
    ).toBeVisible({ timeout: 10000 });
  }

  async function selectAllOrganizationsTab(page: Page) {
    await page.getByRole("tab", { name: /all organizations/i }).click();
    await page.getByRole("combobox").click();
  }

  async function selectDepartment(page: Page, departmentName?: string) {
    // Select specific department or first available department from dropdown
    if (departmentName) {
      await page.getByRole("option", { name: departmentName }).click();
    } else {
      await page.getByRole("option").first().click();
    }
  }

  async function submitAddOrganization(page: Page) {
    await page.getByRole("button", { name: /add organizations/i }).click();
  }

  async function verifyOrganizationAdded(page: Page) {
    await expect(
      page
        .locator("li[data-sonner-toast]")
        .getByText(/organization added successfully/i),
    ).toBeVisible({ timeout: 10000 });
  }

  test("Add Organization button should be disabled when no department selected", async ({
    page,
  }) => {
    await selectAllOrganizationsTab(page);
    const addButton = page.getByRole("button", { name: /add organizations/i });
    await expect(addButton).toBeDisabled();
  });

  test("Add Organization button should be enabled when department is selected", async ({
    page,
  }) => {
    await selectAllOrganizationsTab(page);
    const addButton = page.getByRole("button", { name: /add organizations/i });
    await expect(addButton).toBeDisabled();

    await selectDepartment(page);
    await expect(addButton).toBeEnabled();
  });

  test("Delete organization from encounter", async ({ page }) => {
    // Delete the organization
    await deleteOrganization(page);
    await verifyDeleteSuccess(page);
  });

  test("Add additional organization to existing encounter", async ({
    page,
  }) => {
    // Select all organizations tab and open dropdown
    await selectAllOrganizationsTab(page);

    // Select department from dropdown
    await selectDepartment(page);

    await submitAddOrganization(page);
    await verifyOrganizationAdded(page);
  });
});
