import type { Metadata } from "next";
import Link from "next/link";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Chip } from "@/components/Evidence";
import { Doorway } from "@/components/Doorway";
import { IconArrow, IconExternal } from "@/components/icons";
import { LogisticsStage } from "@/components/logistics/LogisticsStage";

export const metadata: Metadata = {
  title: "Autonomous Logistics & Supply Chain Digital Twin",
  description:
    "Interactive 3D multi-modal logistics simulation reverse-engineered via REA and inspired by NuriTrack (바이브 코딩). Built with React 19, Three.js, React Three Fiber, TypeScript, and Zustand under the decree: AI Interprets, Code Decides.",
};

export default function LogisticsPage() {
  return (
    <Room id="lab" label="Logistics Twin">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 8" }}>
          <h1 className="vinyl vinyl--xl">Autonomous Logistics Digital Twin</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-3)" }}>
            A high-performance 3D multi-modal supply chain control room reverse-engineered via <strong>REA (Reverse Engineer Anything)</strong> and inspired by <strong>NuriTrack</strong> (<em>바이브 코딩 — 김동학</em>).
          </p>
          <p className="wall-text wall-text--soft" style={{ marginTop: "var(--s-2)" }}>
            Built under the architectural decree: <em>&ldquo;AI Interprets, Code Decides&rdquo;</em>. AI natural-language routing constraints are deterministically evaluated by real-time physics and state machines across automated high-bay fulfillment, cross-belt sorters, arterial highway line-hauls, and drone deliveries.
          </p>
          <div className="btn-row" style={{ marginTop: "var(--s-4)" }}>
            <Link className="btn" href="/agents/">Agent command center <IconArrow /></Link>
            <Link className="btn btn--ghost" href="/works/">Verified project gallery <IconArrow /></Link>
            <a
              className="btn btn--ghost"
              href="https://www.youtube.com/watch?v=Lt8XH8HJU_M"
              target="_blank"
              rel="noreferrer"
            >
              NuriTrack Reference Video <IconExternal />
            </a>
          </div>
        </div>

        {/* 3D Multi-modal Interactive Simulation Stage */}
        <div style={{ gridColumn: "1 / -1", marginTop: "var(--s-5)" }}>
          <LogisticsStage />
        </div>

        {/* Technical Curator Wall Label & Architectural Breakdown */}
        <div style={{ gridColumn: "1 / span 7", marginTop: "var(--s-6)" }}>
          <section style={{ display: "grid", gap: "var(--s-4)" }}>
            <h2 className="vinyl vinyl--m">Architectural Decomposition &amp; REA Audit</h2>
            <p className="wall-text">
              Reverse-engineering NuriTrack through REA analysis revealed five decoupled subsystems running on a shared Zustand state bus:
            </p>
            <ul className="lost">
              <li>
                <strong>1. Multimodal Facility Graph:</strong> Warehouse high-bay racks, Gonjiam cross-belt induction loops, Incheon air cargo freight tarmac, Busan container gantry dock, and Bangkok urban smart lockers.
              </li>
              <li>
                <strong>2. Autonomous Machinery Agents:</strong> Real-time AMR path traversal with dynamic directional turning, line-haul semi trucks on dual-lane highway circuits, and hexacopter delivery drones with harmonic altitude hover.
              </li>
              <li>
                <strong>3. Procedural Weather &amp; Day/Night Cycle:</strong> Real-time transitions between golden daytime, vivid sunset rim light, and cyberpunk night modes with particle systems for rain, snow, and autumn wind drift.
              </li>
              <li>
                <strong>4. Zero-Re-render State Bridge:</strong> Zustand decoupling allows 60 FPS animation loops in Three.js without causing cascading React component renders.
              </li>
            </ul>

            <div style={{ marginTop: "var(--s-6)" }}>
              <Doorway to="agents" hint="Explore the studio agent orchestration harness" />
            </div>
          </section>
        </div>

        <div style={{ gridColumn: "span 5", marginTop: "var(--s-6)" }}>
          <WallLabel
            accession="PK-2026-NURI"
            title="NuriTrack Logistics Twin"
            year="2026"
            fields={[
              { k: "Medium", v: "React 19, Three.js 0.186, React Three Fiber, Zustand" },
              { k: "Methodology", v: "REA (Reverse Engineer Anything) Architecture Pass" },
              { k: "Core Rule", v: "AI Interprets, Code Decides (TypeSafe Contract)" },
              { k: "Status", v: "Active Interactive Exhibition / Working Simulation" },
              { k: "Original Demo", v: "NuriTrack by 김동학 (바이브 코딩)" },
            ]}
            chips={
              <>
                <span className="chip chip--live">Active 3D Twin</span>
                <Chip level="source" href="https://www.youtube.com/watch?v=Lt8XH8HJU_M">
                  Watch NuriTrack Demo
                </Chip>
              </>
            }
            label="Exhibition Wall Label"
          />
        </div>
      </div>
    </Room>
  );
}
