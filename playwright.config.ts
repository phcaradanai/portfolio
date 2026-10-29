import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: true,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 2, // shortcut: 2 workers keeps a loaded laptop responsive; raise in CI
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", channel: "chrome", trace: "retain-on-failure", reducedMotion: "reduce" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
  ],
  webServer: { command: "npm start", url: "http://localhost:4173", reuseExistingServer: true, timeout: 60_000 },
});
