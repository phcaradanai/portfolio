import type { Metadata } from "next";
import Link from "next/link";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Doorway } from "@/components/Doorway";
import { IconArrow, IconExternal } from "@/components/icons";

export const metadata: Metadata = {
  title: "Colophon & Technical Specifications",
  description:
    "Design rationale, creative direction, 3D architecture, performance budget, and verification integrity for the Future Museum of Working Software.",
};

export default function ColophonPage() {
  return (
    <Room id="lab" label="Colophon">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 8" }}>
          <h1 className="vinyl vinyl--xl">Colophon &amp; Rationale</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-4)" }}>
            The technical architecture, creative thesis, and performance benchmarks behind this submission. Every design choice is grounded in physical museum grammar and verified software evidence.
          </p>
        </div>

        <div style={{ gridColumn: "1 / span 7", marginTop: "var(--s-6)" }}>
          <section style={{ display: "grid", gap: "var(--s-5)" }}>
            <div>
              <h2 className="vinyl vinyl--m">1. Creative Thesis: Future Museum</h2>
              <p className="wall-text" style={{ marginTop: "var(--s-2)" }}>
                Most portfolios present software as static marketing screenshots or unverifiable resumes. The Future Museum treats software repositories as living architectural artifacts. An orthographic 3D island floats in dark space, housing five specialised districts: Command &amp; Orchestration, Game Laboratories, Foundational Systems, Developer Tools, and the Private Inquiry Vault.
              </p>
            </div>

            <div>
              <h2 className="vinyl vinyl--m">2. 3D Graphics &amp; Isometric Engine</h2>
              <p className="wall-text" style={{ marginTop: "var(--s-2)" }}>
                The 3D stage is powered by Three.js and React Three Fiber (R3F), lazy-loaded via <code>next/dynamic</code> after first paint to preserve near-instant First Contentful Paint:
              </p>
              <ul className="lost" style={{ marginTop: "var(--s-2)" }}>
                <li><strong>Orthographic Camera Rig:</strong> Positioned at 45° isometric angles with smooth exponential damping and seamless district waypoints.</li>
                <li><strong>PBR Materiality &amp; Specular Glints:</strong> Low-roughness clearcoat surfaces with directional specular gleam responsive to camera rotation.</li>
                <li><strong>Atmospheric Ecosystem:</strong> 96 volumetric Tyndall dust motes and 40 harmonic tumbling leaves running on instanced buffers at a locked 60 frames per second.</li>
                <li><strong>EvidenceBeam (Red Thread):</strong> Procedural WebGL light ribbons connecting 3D monuments to their physical wall labels.</li>
              </ul>
            </div>

            <div>
              <h2 className="vinyl vinyl--m">3. Adaptive Capability Tiering</h2>
              <p className="wall-text" style={{ marginTop: "var(--s-2)" }}>
                No visitor is left behind. A deterministic capability probe evaluates WebGL2 support, CPU core count, pointer accuracy, battery-saving headers, and the <code>prefers-reduced-motion</code> media query to route visitors smoothly across three tiers:
              </p>
              <ul className="lost" style={{ marginTop: "var(--s-2)" }}>
                <li><strong>Full Tier:</strong> 60fps R3F 3D island, contact shadows, volumetric dust motes, procedural audio soundscape.</li>
                <li><strong>Lite Tier:</strong> High-efficiency canvas rendering with simplified shader passes for mobile and battery preservation.</li>
                <li><strong>Static Paper View:</strong> Pure 2D archival paper and depth-parallax painting, accessible anytime via the ceiling rail toggle.</li>
              </ul>
            </div>

            <div>
              <h2 className="vinyl vinyl--m">4. Procedural Audio Synthesis</h2>
              <p className="wall-text" style={{ marginTop: "var(--s-2)" }}>
                Zero kilobytes of audio files were downloaded for this site. The ambient soundscape is generated in real-time through the Web Audio API using harmonic sine/triangle oscillators tuned to 55Hz (A1) and 110Hz (A2) through a 280Hz warm resonant lowpass filter, strictly conforming to user-gesture browser autoplay policies.
              </p>
            </div>

            <div>
              <h2 className="vinyl vinyl--m">5. Verification Integrity</h2>
              <p className="wall-text" style={{ marginTop: "var(--s-2)" }}>
                Every metric displayed on this site is checked against git commit history:
              </p>
              <ul className="lost" style={{ marginTop: "var(--s-2)" }}>
                <li><strong>21 Repositories:</strong> Verified with pinned 40-character git commit hashes.</li>
                <li><strong>757 Test Files:</strong> Machine-audited test suites across TypeScript, Rust, and GDScript.</li>
                <li><strong>Zero Fabricated Claims:</strong> Every quote, performance claim, and client outcome is backed by source evidence.</li>
              </ul>
            </div>
          </section>

          <div style={{ marginTop: "var(--s-7)" }}>
            <Doorway to="studio" hint="Explore the interactive Foyer exhibition" />
          </div>
        </div>

        <div style={{ gridColumn: "span 5", marginTop: "var(--s-6)" }}>
          <WallLabel
            accession="PK-SPEC"
            title="System Specifications"
            year="2026"
            fields={[
              { k: "Framework", v: "Next.js 16 (Turbopack, Static Export)" },
              { k: "Runtime", v: "React 19 & React Three Fiber 9" },
              { k: "Graphics", v: "Three.js 0.186 & Custom WebGL Shaders" },
              { k: "Audio", v: "Web Audio API Procedural Synthesis" },
              { k: "Typography", v: "Self-hosted Archivo & Newsreader (Zero CDN)" },
              { k: "Color System", v: "Oklch uniform-perceptual gamut" },
              { k: "Accessibility", v: "WCAG 2.2 Level AA Verified" },
              { k: "Location", v: "Bangkok, Thailand (UTC+7)" },
            ]}
            label="Technical Colophon"
          />
        </div>
      </div>
    </Room>
  );
}
