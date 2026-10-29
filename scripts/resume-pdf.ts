/** Prints /resume/ from the running static preview (npm start) to public/resume.pdf and out/resume.pdf. */
import { chromium } from "@playwright/test";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.PREVIEW_URL ?? "http://localhost:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(`${base}/resume/`, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
const out = path.join(root, "public/resume.pdf");
await page.pdf({ path: out, format: "A4", printBackground: false, margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" } });
await browser.close();
if (existsSync(path.join(root, "out"))) copyFileSync(out, path.join(root, "out/resume.pdf"));
console.log(`resume pdf written: ${path.relative(root, out)}`);
