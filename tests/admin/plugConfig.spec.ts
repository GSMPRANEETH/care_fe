import { expect, test } from "@playwright/test";

test.use({ storageState: "tests/.auth/user.json" });

test.describe("PlugConfig Edit - Submit State", () => {
  test("Save disabled on empty form", async ({ page }) => {
    await page.goto("/admin/apps");
    await page.getByRole("button", { name: /add new config/i }).click();

    await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  test("Save enabled after entering slug", async ({ page }) => {
    await page.goto("/admin/apps");
    await page.getByRole("button", { name: /add new config/i }).click();

    await page.getByRole("textbox", { name: /slug/i }).fill("test-config");

    await expect(page.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("Save disabled on edit when no changes", async ({ page }) => {
    await page.goto("/admin/apps");

    // Click on first existing config to edit
    const firstConfigLink = page.getByRole("link").first();
    if (await firstConfigLink.isVisible()) {
      await firstConfigLink.click();

      await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
    }
  });

  test("Save enabled on edit after modifying meta", async ({ page }) => {
    await page.goto("/admin/apps");

    // Click on first existing config to edit
    const firstConfigLink = page.getByRole("link").first();
    if (await firstConfigLink.isVisible()) {
      await firstConfigLink.click();

      // Modify meta field
      const metaField = page.getByRole("textbox", { name: /meta json/i });
      const currentValue = await metaField.inputValue();
      await metaField.fill(currentValue + "\n// modified");

      await expect(page.getByRole("button", { name: /save/i })).toBeEnabled();
    }
  });
});
