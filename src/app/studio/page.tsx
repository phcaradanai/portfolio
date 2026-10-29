import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Doorway } from "@/components/Doorway";
import { IconArrow, IconExternal } from "@/components/icons";
import { getProfile } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "The studio", description: "Who builds this work, how it is made, what the author works with, and how to get in touch." };

type Practice = { generatedAt: string; repos: Record<string, { repo: string; sha: string; files: number; testFiles: number; found: Record<string, string | null> }> };
const COLS = [
  ["product", "Product intent"], ["design", "Design record"], ["architecture", "Architecture"], ["decisions", "Decision records"], ["verification", "Verification"], ["agentNotes", "Agent notes"],
] as const;
const SHOW = ["Cursed-Market", "relic-tide", "print_ops", "AI_Kingdom", "ScopeFlow", "Project-Explorer", "shadow_council", "ai-product-intelligence", "the-fisher"];

export default function Studio() {
  const profile = getProfile();
  const practice: Practice = JSON.parse(readFileSync(path.join(process.cwd(), "content/practice.json"), "utf8"));
  const rows = SHOW.map((k) => practice.repos[k]).filter(Boolean) as Practice["repos"][string][];
  return (
    <Room id="studio" label="The studio">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 7" }}>
          <h1 className="vinyl vinyl--xl">The studio</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
            I am a programmer in Bangkok. I build business systems and online games, and I work with AI coding agents that I direct and check.
            This exhibition shows that work with the evidence beside it, so you do not have to take my word for any of it.
          </p>
        </div>

        <div style={{ gridColumn: "1 / span 5", alignSelf: "start" }}>
          <WallLabel title={profile.name} fields={[
            { k: "Role", v: profile.role }, { k: "Based in", v: profile.city },
            { k: "Education", v: `${profile.education[0]!.degree}, ${profile.education[0]!.school}, ${profile.education[0]!.start}–${profile.education[0]!.end}` },
          ]} label="Author">
            <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
            <p><a href={SITE.github} rel="me">github.com/phcaradanai <IconExternal width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} /></a></p>
          </WallLabel>
          <div className="btn-row" style={{ marginTop: "var(--s-5)" }}>
            <Link className="btn" href="/resume/">Resume <IconArrow /></Link>
            <a className="btn btn--ghost" href="/resume.pdf" download>Download PDF</a>
          </div>
        </div>

        <section className="paper" style={{ gridColumn: "6 / span 7" }} aria-labelledby="medium">
          <h2 id="medium" className="paper__h">Medium</h2>
          <p className="paper__note" style={{ marginTop: 0, marginBottom: "var(--s-4)" }}>What the author lists on the published CV.</p>
          <dl className="medium">
            {profile.skills.map((g) => (<div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(", ")}</dd></div>))}
          </dl>
        </section>

        <section className="paper" style={{ gridColumn: "1 / -1" }} aria-labelledby="practice">
          <h2 id="practice" className="paper__h">How the work is made</h2>
          <p className="measure" style={{ marginBottom: "var(--s-5)" }}>
            Method claims are cheap, so this table only records which documents exist in each repository, taken from git at a pinned commit.
            A dash means no file of that kind was found by name. Test files are counted by path pattern; counting them says nothing about coverage.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="practice">
              <thead>
                <tr><th scope="col">Repository</th>{COLS.map(([, l]) => <th scope="col" key={l}>{l}</th>)}<th scope="col">Test files</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.repo}>
                    <th scope="row"><a href={`https://github.com/${r.repo}/tree/${r.sha}`}>{r.repo.split("/")[1]}</a> <span className="practice__sha">{r.sha.slice(0, 7)}</span></th>
                    {COLS.map(([k, l]) => {
                      const f = r.found[k];
                      return <td key={k}>{f ? <a href={`https://github.com/${r.repo}/blob/${r.sha}/${f}`} aria-label={`${l}: ${f}`}>{f.split("/").pop()}</a> : <span aria-label={`${l}: none found`}>–</span>}</td>;
                    })}
                    <td>{r.testFiles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="paper__note">Generated {practice.generatedAt.slice(0, 10)} by <code>scripts/gen-practice.ts</code>.</p>
        </section>

        <section style={{ gridColumn: "1 / span 6" }} aria-labelledby="ai">
          <h2 id="ai" className="vinyl vinyl--m">AI, stated plainly</h2>
          <p className="wall-text" style={{ marginTop: "var(--s-4)" }}>
            Many of the repositories in this exhibition were built with AI coding agents, and the repositories document it: agent
            instruction files, prompt histories, and image-generation receipts. Each work&apos;s label lists the tools its repository
            records, and every image says whether it is a screenshot, a project asset, or AI-generated.
          </p>
          <div className="btn-row" style={{ marginTop: "var(--s-4)" }}>
            <Link className="btn btn--ghost" href="/agents/">Enter Agent Command &amp; Vault <IconArrow /></Link>
          </div>
        </section>

        <section style={{ gridColumn: "8 / span 5" }} aria-labelledby="cv">
          <h2 id="cv" className="vinyl vinyl--m">Earlier work</h2>
          <p className="wall-text wall-text--soft" style={{ marginTop: "var(--s-4)" }}>
            The published CV names these projects: {profile.cvProjectLabels.join(", ")}. They are listed as written; no code, screenshots or details are shown.
          </p>
        </section>

        <div style={{ gridColumn: "1 / span 6" }}><Doorway to="works" hint="Start with the work itself." /></div>
      </div>
    </Room>
  );
}
