import { expect, test, type Page } from "@playwright/test";

// The phone menu (a native <details>) must not stay open once it has done its job.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

const menu = (page: Page) => page.locator("header details");
const open = async (page: Page) => {
  await menu(page).locator("summary").click();
  await expect(menu(page)).toHaveJSProperty("open", true);
};

test("choosing a page closes the menu and lands on it", async ({ page }) => {
  await page.goto("/");
  await open(page);
  await menu(page).getByRole("link", { name: "Services" }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(menu(page)).toHaveJSProperty("open", false);
});

test("a link to a section of the same page closes the menu", async ({ page }) => {
  await page.goto("/");
  await open(page);
  await menu(page).locator('a[href="/#how"]').click();
  await expect(menu(page)).toHaveJSProperty("open", false);
});

test("scrolling the page closes the menu", async ({ page }) => {
  await page.goto("/about");
  await open(page);
  await page.mouse.wheel(0, 300);
  await expect(menu(page)).toHaveJSProperty("open", false);
});

test("Escape and a tap outside close it, and the bars still reopen it", async ({ page }) => {
  await page.goto("/about");
  await open(page);
  await page.keyboard.press("Escape");
  await expect(menu(page)).toHaveJSProperty("open", false);
  await open(page);
  await page.mouse.click(40, 700);
  await expect(menu(page)).toHaveJSProperty("open", false);
  await open(page);
});
