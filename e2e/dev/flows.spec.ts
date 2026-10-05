import { expect, test } from "@playwright/test";
import { SAMPLE_REFERENCES } from "../../server/domain/quotes";
import { violations as axe } from "../axe";

// The flows that run in development only (INVARIANTS 28, 29, 31, 32). Axe covers each step a visitor can reach (e2e/axe.ts).

test("the enquiry: one question at a time, consent required, a reference at the end", async ({ page }) => {
  await page.goto("/contact#enquiry");
  const next = page.getByRole("button", { name: "Continue" });
  for (let step = 0; step < 3; step++) {
    // location, service, area
    await next.click(); // nothing chosen: refused with an error, not skipped
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.getByRole("radio").first().check();
    expect(await axe(page)).toEqual([]);
    await next.click();
  }
  await page.getByRole("textbox").first().fill("My father needs a nurse after a hospital stay.");
  await next.click();
  await page.getByLabel("Your name").fill("Test Family");
  await page.getByLabel("Mobile number").fill("9876543210");
  await next.click();
  // INVARIANT 12: no submit without ticked consent; the box starts unticked.
  const consent = page.getByRole("checkbox");
  await expect(consent).not.toBeChecked();
  await page.getByRole("button", { name: "Send my details" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await consent.check();
  await page.getByRole("button", { name: "Send my details" }).click();
  await expect(page.getByText("We have your details.")).toBeVisible();
  await expect(page.getByText("Your reference")).toBeVisible();
  expect(await axe(page)).toEqual([]);
});

test("the queries API refuses what it should", async ({ request }) => {
  const post = (data: unknown, headers: Record<string, string> = {}) =>
    request.post("/api/v1/queries", { data, headers: { "x-nf-client-connection-ip": `192.0.2.${Math.floor(Math.random() * 250)}`, ...headers } });
  expect((await post({})).status()).toBe(422);
  expect((await post({ message: "x".repeat(9_000) })).status()).toBe(413);
  const res = await request.post("/api/v1/queries", { data: "not json", headers: { "content-type": "text/plain" } });
  expect(res.status()).toBe(415);
});

test("a spoofed x-forwarded-for does not buy a fresh rate-limit allowance", async ({ request }) => {
  const ip = `198.51.100.${Math.floor(Math.random() * 250)}`;
  const statuses: number[] = [];
  for (let i = 0; i < 7; i++) {
    const r = await request.post("/api/v1/queries", { data: {}, headers: { "x-nf-client-connection-ip": ip, "x-forwarded-for": `10.9.9.${i}` } });
    statuses.push(r.status());
  }
  expect(statuses.slice(0, 5)).toEqual([422, 422, 422, 422, 422]);
  expect(statuses.slice(5)).toEqual([429, 429]);
});

test("pay: an open sample quote is found by its reference, a wrong one is not", async ({ page }) => {
  const open = SAMPLE_REFERENCES.find((q) => q.status === "open")!;
  await page.goto("/pay");
  expect(await axe(page)).toEqual([]);
  const field = page.getByLabel("Quote reference");
  await field.fill("QT 0000 0000");
  await page.getByRole("button", { name: "Find my quote" }).click();
  await expect(page.getByText(/Check the reference/)).toBeVisible();
  await field.fill(open.reference);
  await page.getByRole("button", { name: "Find my quote" }).click();
  await expect(page.getByText(/Check the reference/)).toHaveCount(0);
  expect(await axe(page)).toEqual([]);
});

test("the partner form validates and sends nothing", async ({ page }) => {
  let sent = 0;
  page.on("request", (r) => r.method() === "POST" && sent++);
  await page.goto("/partner");
  expect(await axe(page)).toEqual([]);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("There is a problem")).toBeVisible();
  expect(sent).toBe(0);
});

test("a service detail page opens in development and passes axe", async ({ page }) => {
  const res = await page.goto("/services/nurse");
  expect(res?.status()).toBe(200);
  expect(await axe(page)).toEqual([]);
});
