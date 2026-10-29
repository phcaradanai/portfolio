/**
 * Turns originals in content/assets-src/<slug>/ into responsive WebP files in public/media/<slug>/
 * and writes content/media.json (dimensions and variants) used by src/lib/media.ts.
 * Only assets referenced by a project JSON are processed. Re-runs skip up-to-date outputs.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { Project } from "../src/content/schema";

const root = path.resolve(import.meta.dirname, "..");
const WIDTHS = [480, 720, 960, 1440];
const manifest: Record<string, { width: number; height: number; variants: { w: number; file: string }[] }> = {};

const dir = path.join(root, "content/projects");
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const p = Project.parse(JSON.parse(readFileSync(path.join(dir, f), "utf8")));
  for (const a of p.assets) {
    const src = path.join(root, "content/assets-src", p.slug, a.file);
    if (!existsSync(src)) { console.warn(`skip ${p.slug}/${a.id}: missing ${a.file}`); continue; }
    const meta = await sharp(src).metadata();
    const [ow, oh] = [meta.width ?? 0, meta.height ?? 0];
    const outDir = path.join(root, "public/media", p.slug);
    mkdirSync(outDir, { recursive: true });
    const variants: { w: number; file: string }[] = [];
    const pixelArt = a.category === "project-asset" && Math.max(ow, oh) <= 512;
    for (const w of WIDTHS.filter((x) => x < ow).concat(ow <= WIDTHS[WIDTHS.length - 1]! ? [ow] : [])) {
      const file = `${a.id}-${w}.webp`;
      const out = path.join(outDir, file);
      if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) {
        await sharp(src).resize({ width: w, withoutEnlargement: true, kernel: pixelArt ? "nearest" : "lanczos3" }).webp({ quality: pixelArt ? 90 : 72, effort: 5 }).toFile(out);
      }
      variants.push({ w, file: `/media/${p.slug}/${file}` });
    }
    manifest[`${p.slug}/${a.id}`] = { width: ow, height: oh, variants };
  }
}
writeFileSync(path.join(root, "content/media.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`media: ${Object.keys(manifest).length} assets`);
