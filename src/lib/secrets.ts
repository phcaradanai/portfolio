export type Finding = { rule: string; match: string; index: number };

const ALLOWED_EMAILS = new Set(["phcaradanai@gmail.com", "noreply@anthropic.com", "noreply@github.com"]);
const PHONE_DIGITS = "925463952"; // owner's number without country/trunk prefix; must never ship

const RULES: { rule: string; re: RegExp; ok?: (m: string) => boolean }[] = [
  { rule: "ipv4", re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, ok: (m) => /^(127\.0\.0\.1|0\.0\.0\.0|255\.255\.255\.\d+)$/.test(m) || m.split(".").some((n) => Number(n) > 255) },
  { rule: "github-token", re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { rule: "api-key", re: /\b(?:sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,})\b/g },
  { rule: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b/g },
  { rule: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { rule: "vercel-id", re: /\b(?:prj|dpl|team)_[A-Za-z0-9]{16,}\b/g },
  // Minified code assigns password fields from variables (password=r.password, password:!0); only literal values count.
  { rule: "password-assignment", re: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"'<>{}]{4,}/gi, ok: (m) => /[:=]\s*(?:!\d|[A-Za-z_$][\w$]*\.[\w$]|[A-Za-z_$][\w$]*\()/.test(m) },
  { rule: "home-path", re: /(?:\/Users\/[A-Za-z0-9._-]+|[A-Z]:\\Users\\[A-Za-z0-9._ -]+)/g },
  { rule: "email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g, ok: (m) => ALLOWED_EMAILS.has(m.toLowerCase()) },
];

/** Returns every pattern that must not appear in shipped content. */
export function findSecrets(raw: string): Finding[] {
  // JSON and RSC payloads escape < and > as \u003c / \u003e; decode so they do not glue onto emails.
  const text = raw.replace(/\\u003[ce]/gi, " ");
  const out: Finding[] = [];
  for (const { rule, re, ok } of RULES) {
    for (const m of text.matchAll(re)) if (!ok?.(m[0])) out.push({ rule, match: m[0], index: m.index ?? 0 });
  }
  // Phone: allow separators between any two digits so "092-546-3952", "+66 92 546 3952" and "(0)92546..." are caught,
  // without matching digits scattered across unrelated text.
  const phone = new RegExp(PHONE_DIGITS.split("").join("[\\s().-]{0,3}"), "g");
  for (const m of text.matchAll(phone)) out.push({ rule: "phone", match: m[0], index: m.index ?? 0 });
  return out;
}
