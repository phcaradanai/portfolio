export type Token = { t: "text" | "strong" | "code"; v: string };

/**
 * Quotes are copied verbatim from Markdown documents, so they carry Markdown syntax.
 * Render the inline subset (**bold**, `code`) and flatten table rows; drop checkbox emoji.
 */
export function inlineTokens(src: string): Token[] {
  const text = src
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, "")
    .replace(/^\s*\|(.*)\|\s*$/gm, (_, row: string) => row.split("|").map((c) => c.trim()).filter(Boolean).join(" · "))
    .replace(/\s{2,}/g, " ")
    .trim();
  const out: Token[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ t: "text", v: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { t: "strong", v: m[1] } : { t: "code", v: m[2]! });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}
