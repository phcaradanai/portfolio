import type { Metadata } from "next";
import Link from "next/link";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Chip } from "@/components/Evidence";
import { Doorway } from "@/components/Doorway";
import { IconArrow, IconExternal } from "@/components/icons";
import { LogisticsStage } from "@/components/logistics/LogisticsStage";
import { FLEET, SITES } from "@/data/logistics/seed";

export const metadata: Metadata = {
  title: "Logistics twin",
  description:
    "A 3D logistics digital twin rebuilt after the NuriTrack demo: three sites, one seeded simulation, and a control room that reads every number from it. React 19, Three.js, React Three Fiber, drei and Zustand.",
};

export default function LogisticsPage() {
  const [trucks, forklifts, amrs] = Object.values(FLEET).reduce((t, [a, b, c]) => [t[0] + a, t[1] + b, t[2] + c], [0, 0, 0]);

  return (
    <Room id="studio" label="Logistics twin">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 8" }}>
          <h1 className="vinyl vinyl--xl">Logistics twin</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-3)" }}>
            A rebuild of <strong>NuriTrack</strong> (<em>바이브 코딩 — 김동학</em>), studied from its walkthrough video. Pick a site,
            click a truck, and read the rule log: every decision in it is plain code.
          </p>
          <div className="btn-row" style={{ marginTop: "var(--s-4)" }}>
            <Link className="btn" href="/agents/#twin">
              Back to agent command <IconArrow />
            </Link>
            <a className="btn btn--ghost" href="https://www.youtube.com/watch?v=Lt8XH8HJU_M" target="_blank" rel="noreferrer">
              NuriTrack walkthrough <IconExternal />
            </a>
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: "var(--s-5)" }}>
          <LogisticsStage />
        </div>

        <div style={{ gridColumn: "1 / span 7", marginTop: "var(--s-6)" }}>
          <section style={{ display: "grid", gap: "var(--s-4)" }}>
            <h2 className="vinyl vinyl--m">How it is built</h2>
            <ul className="lost">
              <li>
                <strong>Data first, 3D as a view.</strong> Sites, docks, vehicles and parcels are typed records. The scene places every
                building, truck and trailer from them, and the control room computes every number from the same store.
              </li>
              <li>
                <strong>A simulation that replays.</strong> A seeded random generator and a pure step function drive the day: the same seed
                gives the same trucks at the same docks at the same minute, and unit tests check it.
              </li>
              <li>
                <strong>Code decides.</strong> Dock assignment, holding trucks in the yard when every dock is busy, and flagging late
                arrivals are plain rules. The rule log shows each one as the simulation makes it.
              </li>
              <li>
                <strong>Motion outside React.</strong> Trucks drive their routes in the render loop; React updates only on the two-second
                simulation tick. With reduced motion the simulation waits for Play and the camera cuts instead of flying.
              </li>
            </ul>

            <div style={{ marginTop: "var(--s-6)" }}>
              <Doorway to="agents" hint="The rest of the agent command walk" />
            </div>
          </section>
        </div>

        <div style={{ gridColumn: "span 5", marginTop: "var(--s-6)" }}>
          <WallLabel
            accession="PK-2026-NURI"
            title="Logistics twin"
            year="2026"
            fields={[
              { k: "Medium", v: "React 19, Three.js, React Three Fiber, drei, Zustand" },
              { k: "Scope", v: `${SITES.length} sites, ${trucks} trucks, ${forklifts} forklifts, ${amrs} AMRs` },
              { k: "Simulation", v: "Seeded and deterministic, unit-tested" },
              { k: "After", v: "NuriTrack by 김동학 (바이브 코딩)" },
            ]}
            chips={
              <Chip level="source" href="https://www.youtube.com/watch?v=Lt8XH8HJU_M">
                Reference video
              </Chip>
            }
            label="Exhibition wall label"
          />
        </div>
      </div>
    </Room>
  );
}
