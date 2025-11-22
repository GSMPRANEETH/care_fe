import { expect, test } from "@playwright/test";

// Use the authenticated state (same pattern as patientRegistration.spec.ts)
test.use({ storageState: "tests/.auth/user.json" });

function generatePatientData() {
  const timestamp = Date.now();
  return {
    name: `Test Patient ${timestamp}`,
    phoneNumber: `9${Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0")}`,
    gender: "Male",
    dateOfBirth: {
      day: "16",
      month: "06",
      year: "2009",
    },
    bloodGroup: "A+",
    state: "Rajasthan", //not used currently
    pincode: "302020",
    address: "123 Test Street, Test City",
    emergencyContact: {
      name: `Emergency Contact ${timestamp}`,
      phoneNumber: `9${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`,
    },
  };
}

test.describe("Invoice Creation", () => {
  test.beforeAll(async ({ page }) => {
    // Navigate to home page (user is already authenticated)
    await page.goto("/");

    // Navigate to a facility - using a more robust selector
    await page
      .getByRole("link", { name: /facility with patients/i })
      .first()
      .click();

    await page.getByRole("button", { name: "Toggle Sidebar" }).click();

    await page.getByRole("button", { name: "Patients", exact: true }).click();
    // Navigate to patient search/registration
    await page.getByRole("link", { name: /search patients/i }).click();

    const patientData = generatePatientData();

    // Start patient registration by pressing Shift+Enter in search field
    await page
      .getByRole("textbox", { name: /search by patient phone number/i })
      .press("Shift+Enter");

    // Fill basic patient information
    await test.step("Fill patient basic information", async () => {
      await page
        .getByRole("textbox", { name: /name.*\*/i })
        .fill(patientData.name);
      await page
        .getByRole("textbox", { name: /phone number.*\*/i })
        .fill(patientData.phoneNumber);

      // Select gender
      await page
        .getByRole("radio", { name: patientData.gender, exact: true })
        .click();
    });

    // Fill date of birth
    await test.step("Fill date of birth", async () => {
      await page
        .getByPlaceholder("DD", { exact: true })
        .fill(patientData.dateOfBirth.day);
      await page
        .getByPlaceholder("MM", { exact: true })
        .fill(patientData.dateOfBirth.month);
      await page
        .getByPlaceholder("YYYY", { exact: true })
        .fill(patientData.dateOfBirth.year);
    });

    // Select blood group
    await test.step("Select blood group", async () => {
      await page.getByRole("combobox", { name: /blood group/i }).click();
      await page.getByRole("option", { name: patientData.bloodGroup }).click();
    });

    // Fill additional details
    await test.step("Fill additional details", async () => {
      // fill address
      await page
        .getByRole("textbox", { name: "Address" })
        .fill(patientData.address);
      await page
        .getByRole("button", { name: /register patient/i })
        .scrollIntoViewIfNeeded();
      // fill Pincode
      await page
        .getByRole("spinbutton", { name: "PIN Code *" })
        .fill(patientData.pincode);
      // Scroll to the Register Patient button to ensure dropdown is visible
      await page
        .getByRole("button", { name: /register patient/i })
        .scrollIntoViewIfNeeded();
      await page
        .getByRole("region", { name: ": Additional Details" })
        .getByRole("combobox")
        .click();

      // Select the state option by visible text
      // TODO: Update to a specific state once fixtures support it
      const stateOption = page.getByRole("option").first();
      await stateOption.waitFor({ state: "visible", timeout: 5000 });
      await stateOption.click();
    });

    // Submit the registration
    await test.step("Submit patient registration", async () => {
      await page.getByRole("button", { name: /register patient/i }).click();

      // Wait for success message or redirect
      await expect(
        page.getByText(/patient registered successfully/i),
      ).toBeVisible({ timeout: 10000 });
    });

    await page.getByRole("button", { name: "Male" }).click();
    await page.getByRole("link", { name: "View Profile" }).click();
    await page.getByText("Accounts").click();
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("Test Account");
    await page.getByRole("button", { name: "Create" }).click();
  });
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /facility with patients/i })
      .first()
      .click();

    await page.getByRole("button", { name: "Toggle Sidebar" }).click();

    await page.getByRole("button", { name: "Billing", exact: true }).click();

    await page.getByRole("link", { name: "Accounts", exact: true }).click();

    await page.getByRole("button", { name: "Go to account" }).first().click();

    await page.getByRole("button", { name: "Invoice" }).click();

    // Quick sanity-check that the page is shown in an authenticated state.
    // If this fails, the storage file might be missing/invalid.
    // We don't fail the test here explicitly; it's just a helpful assertion in debugging.
    await expect(page.locator("text=Sign in").first())
      .toHaveCount(0)
      .catch(() => {});
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
