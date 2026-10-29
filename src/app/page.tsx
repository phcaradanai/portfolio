import Link from "next/link";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Chip } from "@/components/Evidence";
import { Doorway } from "@/components/Doorway";
import { IconArrow } from "@/components/icons";
import { getProfile, getProject, tiers } from "@/lib/content";
import { media } from "@/lib/media";
import { WorkPiece } from "@/components/WorkPiece";
import { MATURITY, madeBy, period } from "@/lib/view";
import { FoyerFutureHero } from "@/components/world/FoyerFutureHero";

const ON_THE_WALL = ["cursed-market", "print-ops", "codescape"] as const;

export default function Foyer() {
  const profile = getProfile();
  const rt = getProject("relic-tide");
  const color = rt && media("relic-tide", "atlantis-colour");
  const depth = rt && media("relic-tide", "atlantis-depth");
  const colorAsset = rt?.assets.find((a) => a.id === "atlantis-colour");
  const { A, B, C } = tiers();
  const wall = ON_THE_WALL.map((s) => getProject(s)).filter((p) => !!p);

  return (
    <>
      <Room id="studio" label="Foyer">
        <div className="wall">
          <div className="foyer__intro">
            <h1 className="vinyl vinyl--xl">{profile.name}</h1>
            <p className="wall-text foyer__lede">
              Programmer and developer in Bangkok. I build systems that run and games that play, and every claim here comes with the evidence to check it.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/works/">Enter the galleries <IconArrow /></Link>
              <Link className="btn btn--ghost" href="/agents/">Isometric agent world <IconArrow /></Link>
              <Link className="btn btn--ghost" href="/logistics/">3D Logistics twin <IconArrow /></Link>
              <Link className="btn btn--ghost" href="/lab/">Read the code <IconArrow /></Link>
            </div>
          </div>

          <FoyerFutureHero
            rtAccession={rt?.accession ?? "PK-0001"}
            colorSrc={color?.src ?? "/media/works/relic-tide/atlantis-colour.avif"}
            depthSrc={depth?.src ?? "/media/works/relic-tide/atlantis-depth.avif"}
            srcSet={color?.srcSet ?? ""}
            width={color?.width ?? 1200}
            height={color?.height ?? 800}
            alt={colorAsset?.alt ?? "Atlantis city backdrop study"}
          />
        </div>
      </Room>

      <Room id="works" label="On the wall now">
        <div className="wall">
          <h2 className="vinyl vinyl--l" style={{ gridColumn: "1 / span 8" }}>On the wall now</h2>
          {wall.map((p, i) => {
            const left = i % 2 === 0;
            return (
              <div key={p!.slug} className="onwall" data-side={left ? "left" : "right"}>
                <WorkPiece p={p!} href={`/works/${p!.slug}/`} />
                <WallLabel
                  accession={p!.accession} title={p!.title} year={p!.period.start.slice(0, 4)}
                  fields={[
                    { k: "Medium", v: p!.stack.slice(0, 5).join(", ") },
                    { k: "Made", v: period(p!) },
                    { k: "Made by", v: madeBy(p!) },
                    { k: "Status", v: MATURITY[p!.maturity] },
                  ]}
                  chips={<Chip level="source" href={`/works/${p!.slug}/`}>Open the evidence</Chip>}
                >
                  <p>{p!.tagline}</p>
                </WallLabel>
              </div>
            );
          })}
          <p className="wall-text wall-text--soft" style={{ gridColumn: "1 / span 7" }}>
            {A.length} full case studies, {B.length} shorter entries, and {C.length} works in storage that can only be described.
          </p>
          <div style={{ gridColumn: "1 / span 6" }}><Doorway to="works" hint="Every public work, with its evidence." /></div>
        </div>
      </Room>
    </>
  );
}
