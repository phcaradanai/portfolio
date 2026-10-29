import { codeToHtml } from "shiki";

const cache = new Map<string, string>();

/** Build-time syntax highlighting. Returns static HTML; no highlighter ships to the browser. */
export async function highlight(code: string, lang: string): Promise<string> {
  const key = `${lang}\0${code}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let html: string;
  try {
    html = await codeToHtml(code, { lang, theme: "github-dark-high-contrast" });
  } catch {
    html = await codeToHtml(code, { lang: "text", theme: "github-dark-high-contrast" });
  }
  cache.set(key, html);
  return html;
}
