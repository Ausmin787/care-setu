import { expect, test } from "@playwright/test";
import { violations } from "../axe";

// What a visitor gets from the production build. Every built page loads, has no console errors and no WCAG A/AA axe
// violations; unbuilt and development-only pages 404 (D-040, D-043); nothing is indexable (INVARIANT 30).
const built = ["/", "/services", "/about", "/contact", "/faq", "/partner", "/pay", "/privacy"];
const hidden = ["/terms", "/refunds", "/dev", "/services/nurse"];

// Desktop and a phone: the Home statement's faint unread words only failed at phone size (D-050).
const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
];

for (const { name, ...size } of sizes)
  for (const path of built) {
    test(`${path} loads clean and passes axe (${name})`, async ({ page }) => {
      await page.setViewportSize(size);
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await page.waitForLoadState("networkidle");
      expect(await violations(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

for (const path of hidden) {
  test(`${path} is a 404 in production`, async ({ request }) => {
    expect((await request.get(path)).status()).toBe(404);
  });
}

test("the APIs are closed and nothing is indexable", async ({ request }) => {
  const post = (url: string, data: object) => request.post(url, { data });
  expect((await post("/api/v1/queries", {})).status()).toBe(404);
  expect((await post("/api/v1/payments", { reference: "4K7M9P2X" })).status()).toBe(404);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow:\s*\//);
});

test("the contact page offers the call card and no form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible(); // the call card, not the nav (hidden on phones)
});
