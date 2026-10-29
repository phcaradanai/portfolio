import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

type P = { slug: string; tier: "A" | "B" | "C"; excerpts: unknown[]; assets: unknown[] };
const dir = path.join(process.cwd(), "content/projects");
const projects: P[] = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")));
const shown = projects.filter((p) => p.tier !== "C");
const ROUTES = ["/", "/works/", "/agents/", "/lab/", "/gallery/", "/studio/", "/journey/", "/resume/", ...shown.map((p) => `/works/${p.slug}/`)];
const PHONE = /9\D{0,3}2\D{0,3}5\D{0,3}4\D{0,3}6\D{0,3}3\D{0,3}9\D{0,3}5\D{0,3}2/;

async function visit(page: Page, url: string) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto(url, { waitUntil: "load" });
  return { res, errors };
}

for (const route of ROUTES) {
  test(`route ${route}: loads, one h1, no console errors, no phone number, no horizontal overflow`, async ({ page }) => {
    const { res, errors } = await visit(page, route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(PHONE.test(await page.locator("body").innerText())).toBe(false);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test(`route ${route}: no serious or critical axe violations`, async ({ page }) => {
    test.setTimeout(400_000); // axe walks every node; long case studies take minutes on a loaded laptop
    await page.goto(route, { waitUntil: "load" });
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.length} nodes, e.g. ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}

test("works index lists every tier and keeps private repos unlinked", async ({ page }) => {
  await page.goto("/works/");
  await expect(page.locator('[data-tier="A"]')).toHaveCount(projects.filter((p) => p.tier === "A").length);
  await expect(page.locator('[data-tier="B"]')).toHaveCount(projects.filter((p) => p.tier === "B").length);
  await expect(page.locator(".crate")).toHaveCount(projects.filter((p) => p.tier === "C").length);
  await expect(page.locator('.crate a[href*="github.com"]')).toHaveCount(0);
});

test("sparse pages have no empty frames", async ({ page }) => {
  for (const p of shown.filter((x) => x.tier === "B")) {
    await page.goto(`/works/${p.slug}/`);
    const empty = await page.locator(".frame__mat").evaluateAll((els) => els.filter((e) => !e.querySelector("img, canvas, svg")).length);
    expect(empty, p.slug).toBe(0);
  }
});

test("excerpt links point at a pinned commit and line range", async ({ page }) => {
  await page.goto("/lab/");
  const hrefs = await page.locator(".code__head a").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/github\.com\/phcaradanai\/[^/]+\/blob\/[0-9a-f]{40}\/.+#L\d+-L\d+$/);
});

test("evidence deep link lands below the sticky rail and is highlighted", async ({ page }) => {
  await page.goto("/works/relic-tide/#e-E1");
  const rail = (await page.locator(".rail").boundingBox())!;
  const target = page.locator("#e-E1");
  await expect(target).toBeVisible();
  const box = (await target.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(rail.y + rail.height - 1);
  expect(await target.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("lab tabs work with the keyboard and deep links", async ({ page }) => {
  await page.goto("/lab/");
  await page.locator('[role="tablist"][data-ready]').waitFor();
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  const second = await tabs.nth(1).getAttribute("aria-controls");
  await expect(page.locator(`#${second}`)).toBeVisible();
  await page.goto("/lab/#relic-tide");
  await page.locator('[role="tablist"][data-ready]').waitFor();
  await expect(page.locator("#panel-relic-tide")).toBeVisible();
});

test("gallery viewer opens, steps with arrows, closes with Escape and returns focus", async ({ page }) => {
  await page.goto("/gallery/");
  const first = page.locator(".hang__item").first();
  await first.click();
  const dialog = page.locator("dialog.viewer[open]");
  await expect(dialog).toBeVisible();
  const src1 = await dialog.locator("img").getAttribute("src");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("img")).not.toHaveAttribute("src", src1 ?? "");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.viewer[open]")).toHaveCount(0);
  await expect(first).toBeFocused();
});

test("gallery filter shows only the chosen kind", async ({ page }) => {
  await page.goto("/gallery/");
  const btn = page.locator(".filters button", { hasText: "AI-generated image" });
  test.skip((await btn.count()) === 0, "no AI-generated items");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  const labels = await page.locator(".hang__cap span:first-of-type").allInnerTexts();
  for (const l of labels) expect(l).toContain("AI-generated image");
});

test("reduced motion keeps the painting still", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);
  await expect(page.locator(".depth__gl")).toHaveAttribute("data-live", "false");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the painting falls back to its image and every lab panel is readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".depth img")).toBeVisible();
    await page.goto("/lab/");
    const panels = page.locator('[role="tabpanel"]');
    const n = await panels.count();
    for (let i = 0; i < n; i++) await expect(panels.nth(i)).toBeVisible();
  });
});

test("mobile rooms menu opens from the keyboard", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const summary = page.locator(".rail__menu > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".rail__sheet a", { hasText: "Engineering lab" })).toBeVisible();
});

test("agents isometric world docks monuments, filters pipeline stages, and updates inquiry brief", async ({ page }) => {
  await page.goto("/agents/");
  await expect(page.locator("canvas.iso-canvas")).toBeVisible();
  const relicBtn = page.locator(".iso-dock-btn", { hasText: "Relic Tide" });
  await relicBtn.click();
  await expect(relicBtn).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".iso-dossier h2")).toContainText("Relic Tide");

  const stageBtn = page.locator(".iso-stage-pill", { hasText: "S02 · CONTEXT" });
  await stageBtn.click();
  await expect(stageBtn).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".iso-stage-detail")).toContainText("Path-Confined MCP");

  const thBtn = page.locator(".inquiry-desk__lang button", { hasText: "ข้อความภาษาไทย" });
  await thBtn.click();
  await expect(thBtn).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".inquiry-composer__textarea")).toHaveValue(/สวัสดีครับ/);
});
