/**
 * Screenshots with one browser for every route (relaunching per route times out on a loaded machine).
 * tsx scripts/shoot.ts <baseUrl> <outDir> <route:name>... [--full] [--sizes=1440x900,390x844]
 * Each capture scrolls the page first so lazy images load, and runs with reduced motion so nothing is mid-animation.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const args = process.argv.slice(2);
const [base, outDir] = args;
const pairs = args.slice(2).filter((a) => !a.startsWith("--"));
if (!base || !outDir || !pairs.length) throw new Error("usage: shoot <baseUrl> <outDir> <route:name>... [--full] [--sizes=WxH,...]");
const full = args.includes("--full");
const sizes = (args.find((a) => a.startsWith("--sizes="))?.slice(8) ?? "1440x900,390x844").split(",");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true, timeout: 300_000 });
for (const s of sizes) {
  const [w, h] = s.split("x").map(Number) as [number, number];
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  for (const pair of pairs) {
    const [route, name] = pair.split(":") as [string, string];
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    try {
      await page.goto(base + route, { waitUntil: "load", timeout: 180_000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      const file = `${outDir}/${name}-${w}.png`;
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      if (full && height > 16000) {
        // Chromium repeats content past a 16384 px texture; capture clipped segments and stitch them.
        const parts: { input: Buffer; top: number; left: number }[] = [];
        for (let y = 0; y < height; y += 8000) {
          const input = await page.screenshot({ clip: { x: 0, y, width: w, height: Math.min(8000, height - y) }, fullPage: true, timeout: 300_000, animations: "disabled" });
          parts.push({ input, top: y, left: 0 });
        }
        await sharp({ create: { width: w, height, channels: 3, background: "#000" } }).composite(parts).png().toFile(file);
      } else {
        await page.screenshot({ path: file, fullPage: full, timeout: 300_000, animations: "disabled" });
      }
      console.log(file, errors.length ? errors.slice(0, 3) : "no console errors");
    } catch (e) {
      console.log(`FAILED ${name}-${w}: ${(e as Error).message.split("\n")[0]}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
