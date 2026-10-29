/** Builds content/journey.json from the GitHub API: repositories per year and language. Private repos are counted, never named. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

type Repo = { name: string; createdAt: string; pushedAt: string; isPrivate: boolean; isFork: boolean; primaryLanguage: { name: string } | null; description: string };
const raw = execFileSync("gh", ["repo", "list", "phcaradanai", "--limit", "200", "--json", "name,createdAt,pushedAt,isPrivate,isFork,primaryLanguage,description"], { encoding: "utf8" });
const all = JSON.parse(raw) as Repo[];

const generated = (r: Repo) => /(^|-)(proof|smoke|probe)(-|$)|^platform-(phase|p21|factory|operational|runtime)|^phase55|^frontend-standards-probe|^workspace-hub$/i.test(r.name);
const own = all.filter((r) => !r.isFork);
const generatedRepos = own.filter(generated);
const counted = own.filter((r) => !generated(r));

const years: Record<string, { public: number; private: number; languages: Record<string, number> }> = {};
for (const r of counted) {
  const y = r.createdAt.slice(0, 4);
  const e = (years[y] ??= { public: 0, private: 0, languages: {} });
  r.isPrivate ? e.private++ : e.public++;
  const lang = r.primaryLanguage?.name ?? "Other";
  e.languages[lang] = (e.languages[lang] ?? 0) + 1;
}
const out = {
  generatedAt: new Date().toISOString(),
  source: "gh repo list phcaradanai (GitHub API)",
  note: "Repositories created per year, excluding forks and generated verification repositories. Private repositories are counted by language only.",
  totals: { owned: own.length, counted: counted.length, generatedExcluded: generatedRepos.length, forksExcluded: all.length - own.length, public: counted.filter((r) => !r.isPrivate).length, private: counted.filter((r) => r.isPrivate).length },
  years: Object.fromEntries(Object.entries(years).sort(([a], [b]) => a.localeCompare(b))),
  firstRepoCreatedAt: counted.map((r) => r.createdAt).sort()[0],
};
writeFileSync(path.resolve(import.meta.dirname, "../content/journey.json"), JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify(out.totals), Object.entries(out.years).map(([y, e]) => `${y}:${e.public}+${e.private}`).join(" "));
