import { readFileSync } from "node:fs";
import path from "node:path";

type Entry = { width: number; height: number; variants: { w: number; file: string }[] };
let manifest: Record<string, Entry> | undefined;

export type Media = { src: string; srcSet: string; width: number; height: number };

/** Responsive image data for a project asset, from content/media.json (built by `npm run media`). */
export function media(slug: string, assetId: string): Media | undefined {
  manifest ??= JSON.parse(readFileSync(path.join(process.cwd(), "content/media.json"), "utf8"));
  const e = manifest![`${slug}/${assetId}`];
  if (!e || e.variants.length === 0) return undefined;
  const mid = e.variants[Math.min(1, e.variants.length - 1)]!;
  return {
    src: mid.file,
    srcSet: e.variants.map((v) => `${v.file} ${v.w}w`).join(", "),
    width: e.width,
    height: e.height,
  };
}
