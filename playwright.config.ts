import { defineConfig } from "@playwright/test";

// Browser checks (D-049). Two projects, because the site behaves differently by environment (INVARIANTS 28, 29, 31, 32):
// `prod` runs against `next start` (what visitors get: closed states, 404s, no sample data) and `dev` against `next dev`
// (the enquiry, Pay and Partner flows that run in development only). Locally Chrome is used; CI installs Chromium.
const channel = process.env.CI ? undefined : "chrome";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { channel, trace: "retain-on-failure" },
  projects: [
    { name: "prod", testDir: "./e2e/prod", use: { baseURL: "http://localhost:3100" } },
    // `next dev` compiles each page on its first visit, so the flows get a longer limit (one run in CI timed out at 30 s).
    { name: "dev", testDir: "./e2e/dev", timeout: 90_000, use: { baseURL: "http://localhost:3200" } },
  ],
  webServer: [
    { command: "npm run start -- -p 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 120_000 },
    { command: "npm run dev -- -p 3200", url: "http://localhost:3200", reuseExistingServer: !process.env.CI, timeout: 180_000 },
  ],
});
