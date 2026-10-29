import type { Metadata } from "next";
import Link from "next/link";
import { Room } from "@/components/Room";
import { Bay } from "@/components/Bay";
import { Crate } from "@/components/Crate";
import { Doorway } from "@/components/Doorway";
import { tiers } from "@/lib/content";
import { KIND, MATURITY, period } from "@/lib/view";

export const metadata: Metadata = {
  title: "Project worlds",
  description: "Every public work in the exhibition, from multiplayer games to a print gateway and an AI agent control plane, plus private work in storage.",
};

export default function Works() {
  const { A, B, C } = tiers();
  return (
    <>
      <Room id="works" label="Project worlds">
        <div className="wall">
          <div style={{ gridColumn: "1 / span 8" }}>
            <h1 className="vinyl vinyl--xl">Project worlds</h1>
            <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
              {A.length} works hang here with their full story, {B.length} more sit on the shelf below, and {C.length} are crated in storage.
              Each label gives the medium, the dates from git, and who made it. Open a work to see every claim next to its evidence.
            </p>
          </div>
          {A.map((p, i) => <Bay key={p.slug} p={p} side={i % 2 === 0 ? "left" : "right"} priority={i === 0} />)}
        </div>
      </Room>

      <Room id="works" label="Also on the wall" className="room--shelf">
        <div className="wall">
          <h2 className="vinyl vinyl--l" style={{ gridColumn: "1 / span 8" }}>Also on the wall</h2>
          <ul className="shelf" style={{ gridColumn: "1 / -1" }}>
            {B.map((p) => (
              <li key={p.slug} data-tier="B">
                <span className="shelf__acc">{p.accession}</span>
                <div className="shelf__main">
                  <h3><Link href={`/works/${p.slug}/`}>{p.title}</Link></h3>
                  <p>{p.tagline}</p>
                </div>
                <p className="shelf__meta">{KIND[p.kind]} · {MATURITY[p.maturity]}<br />{period(p)}<br />{p.stack.slice(0, 4).join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      </Room>

      <Room id="storage" label="In storage">
        <div className="wall">
          <div style={{ gridColumn: "1 / span 7" }}>
            <h2 className="vinyl vinyl--l">In storage</h2>
            <p className="wall-text" style={{ marginTop: "var(--s-4)" }}>
              Private repositories. Their storage tags are written from metadata only: languages, dates and commit counts.
              Nothing inside is shown, and their names stay off this site.
            </p>
          </div>
          <div className="crates" style={{ gridColumn: "1 / -1" }}>
            {C.map((p) => <Crate key={p.slug} p={p} />)}
          </div>
          <div style={{ gridColumn: "1 / span 6" }}><Doorway to="lab" hint="Read the code behind the public works." /></div>
        </div>
      </Room>
    </>
  );
}
