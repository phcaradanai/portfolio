import type { Metadata } from "next";
import Link from "next/link";
import { Room } from "@/components/Room";
import { Tabs } from "@/components/Tabs";
import { Blueprint } from "@/components/Blueprint";
import { CodeBlock } from "@/components/CodeBlock";
import { CaptureBlock } from "@/components/CaptureBlock";
import { Doorway } from "@/components/Doorway";
import { IconArrow } from "@/components/icons";
import { getCapture, getProjects } from "@/lib/content";
import { KIND, MATURITY, sha7 } from "@/lib/view";

export const metadata: Metadata = {
  title: "Engineering lab",
  description: "Read-only workbench of real source excerpts, architecture drawings and recorded command runs from the public repositories, each pinned to a commit.",
};

export default function Lab() {
  const benches = getProjects().filter((p) => p.tier !== "C" && (p.excerpts.length > 0 || p.diagram));
  const first = benches[0]?.slug;
  return (
    <Room id="lab" label="Engineering lab">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 8" }}>
          <h1 className="vinyl vinyl--xl">Engineering lab</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
            The conservation lab, where works are opened up. Every excerpt is real code copied from git at the commit shown, and checked against
            that commit when the site is built. These are curated excerpts and recordings, not live sessions.
          </p>
        </div>

        <div className="bench" style={{ gridColumn: "1 / -1" }}>
          <noscript><style>{`.bench [role=tabpanel][hidden]{display:grid !important}`}</style></noscript>
          <Tabs label="Projects on the bench" hash defaultId={first} tabs={benches.map((p) => ({ id: p.slug, label: p.title.replace(/\s*\(.*\)$/, "") }))} />
          {benches.map((p) => {
            const repo = p.repo?.url.replace("https://github.com/", "") ?? "";
            const captures = p.captures.map(getCapture).filter((c) => !!c);
            return (
              <section key={p.slug} id={`panel-${p.slug}`} role="tabpanel" aria-labelledby={`tab-${p.slug}`} hidden={p.slug !== first} className="bench__panel" tabIndex={0}>
                <header className="bench__head">
                  <h2 className="vinyl vinyl--m">{p.title}</h2>
                  <p className="wall-text wall-text--soft">
                    {KIND[p.kind]}, {MATURITY[p.maturity].toLowerCase()}. {p.excerpts.length} excerpt{p.excerpts.length === 1 ? "" : "s"}
                    {captures.length ? `, ${captures.length} recorded run${captures.length === 1 ? "" : "s"}` : ""}
                    {p.repo ? `, pinned at ${sha7(p.repo.pinnedSha)}` : ""}.
                  </p>
                  <Link className="btn btn--ghost" href={`/works/${p.slug}/`}>Read the case study <IconArrow /></Link>
                </header>
                {p.diagram && (
                  <figure className="bench__drawing">
                    <Blueprint diagram={p.diagram} title={p.title} />
                    <figcaption>Architecture drawn from the modules in the repository.</figcaption>
                  </figure>
                )}
                <div className="bench__code">
                  {p.excerpts.map((x) => <CodeBlock key={x.id} x={x} repo={repo} />)}
                </div>
                {captures.length > 0 && <div className="bench__runs">{captures.map((c) => <CaptureBlock key={c!.id} c={c!} />)}</div>}
              </section>
            );
          })}
        </div>
        <div style={{ gridColumn: "1 / span 6" }}><Doorway to="gallery" hint="Pictures from the work, with provenance." /></div>
      </div>
    </Room>
  );
}
