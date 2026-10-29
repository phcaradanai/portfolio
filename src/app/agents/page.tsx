import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import { Blueprint } from "@/components/Blueprint";
import { XRay } from "@/components/XRay";
import { Doorway } from "@/components/Doorway";
import { Chip } from "@/components/Evidence";
import { IconArrow, IconExternal, IconPrivate } from "@/components/icons";
import { LogisticsStage } from "@/components/logistics/LogisticsStage";
import {
  IsometricAgentWorld,
  VaultInquiryDesk,
  type IsoDistrict,
  type IsoMonument,
} from "@/components/IsometricAgentWorld";
import { getProfile, getProjects, tiers } from "@/lib/content";
import { media } from "@/lib/media";
import { SITE } from "@/lib/site";
import { heroAsset, KIND, MATURITY, period, sha7 } from "@/lib/view";

export const metadata: Metadata = {
  title: "Agent command & isometric studio",
  description:
    "Interactive isometric exhibition of Phatcharadanai Kanyapan's AI agent orchestration harness, 21 verified repositories, and the private vault of additional works available on direct inquiry.",
};

type PracticeRepo = {
  repo: string;
  sha: string;
  files: number;
  testFiles: number;
  found: Record<string, string | null>;
};
type PracticeData = { generatedAt: string; repos: Record<string, PracticeRepo> };
type JourneyData = { totals: Record<string, number> };

const COORDS: Record<
  string,
  { x: number; y: number; h: number; district: IsoDistrict; short: string; stages: number[] }
> = {
  "logistics-twin": {
    x: -1.2,
    y: -0.8,
    h: 2.15,
    district: "command",
    short: "Logistics Twin 3D",
    stages: [1, 2, 3, 4, 5, 6],
  },
  "ai-kingdom": {
    x: -2.0,
    y: -2.0,
    h: 2.18,
    district: "command",
    short: "AI Kingdom",
    stages: [1, 2, 3, 5, 6],
  },
  "chatgpt-mcp": {
    x: -3.5,
    y: -1.7,
    h: 1.38,
    district: "command",
    short: "ChatGPT MCP (Rust)",
    stages: [1, 2, 5, 6],
  },
  "ai-product-intelligence": {
    x: -1.7,
    y: -3.5,
    h: 1.52,
    district: "command",
    short: "AI Product Intel",
    stages: [1, 3, 4, 6],
  },
  "platform-control-plane": {
    x: -3.5,
    y: -3.3,
    h: 1.58,
    district: "command",
    short: "Control Plane",
    stages: [1, 3, 6],
  },
  "cursed-market": {
    x: 2.0,
    y: -2.0,
    h: 2.22,
    district: "games",
    short: "Cursed Market",
    stages: [1, 3, 4, 6],
  },
  "relic-tide": {
    x: 3.5,
    y: -1.8,
    h: 2.08,
    district: "games",
    short: "Relic Tide",
    stages: [1, 2, 3, 4, 6],
  },
  "the-fisher": {
    x: 1.8,
    y: -3.5,
    h: 1.38,
    district: "games",
    short: "The Fisher",
    stages: [1, 3, 4, 6],
  },
  "shadow-council": {
    x: 3.5,
    y: -3.4,
    h: 1.42,
    district: "games",
    short: "Shadow Council",
    stages: [1, 3, 6],
  },
  "room-25": {
    x: 0.7,
    y: -2.7,
    h: 1.62,
    district: "games",
    short: "Room 25 Ultimate",
    stages: [1, 3, 6],
  },
  "splendor-online": {
    x: 2.7,
    y: -0.6,
    h: 1.32,
    district: "games",
    short: "Splendor Online",
    stages: [1, 3, 4, 6],
  },
  "pvp-td": {
    x: 3.8,
    y: -0.4,
    h: 1.44,
    district: "games",
    short: "PvP Tower Tactics",
    stages: [1, 6],
  },
  "coup-coop": {
    x: 0.7,
    y: -3.8,
    h: 1.18,
    district: "games",
    short: "Coup Co-op",
    stages: [1, 4],
  },
  "print-ops": {
    x: -2.0,
    y: 2.0,
    h: 2.28,
    district: "systems",
    short: "PrintOps",
    stages: [1, 3, 4, 6],
  },
  "vending-3d-ctl-agent": {
    x: -3.5,
    y: 3.4,
    h: 1.45,
    district: "systems",
    short: "Vending Serial API",
    stages: [1, 3, 5, 6],
  },
  "the-patch-press": {
    x: -0.7,
    y: 2.8,
    h: 1.24,
    district: "systems",
    short: "The Patch Press",
    stages: [6],
  },
  scopeflow: {
    x: -3.5,
    y: 1.8,
    h: 1.96,
    district: "tools",
    short: "ScopeFlow (Tauri)",
    stages: [1, 3, 6],
  },
  codescape: {
    x: -1.8,
    y: 3.5,
    h: 1.88,
    district: "tools",
    short: "CodeScape",
    stages: [1, 2, 3, 6],
  },
  "storage-go-integration-service": {
    x: 3.5,
    y: 1.8,
    h: 1.5,
    district: "vault",
    short: "Go Integration (Vault)",
    stages: [5, 6],
  },
  "storage-rust-command-service": {
    x: 1.8,
    y: 3.5,
    h: 1.32,
    district: "vault",
    short: "Rust Command (Vault)",
    stages: [5, 6],
  },
  "storage-godot-tower-defence": {
    x: 3.5,
    y: 3.4,
    h: 1.26,
    district: "vault",
    short: "Godot TD (Vault)",
    stages: [4, 5],
  },
  "storage-go-vending-service": {
    x: 0.7,
    y: 3.6,
    h: 1.22,
    district: "vault",
    short: "Go Vending (Vault)",
    stages: [5, 6],
  },
};

const HARNESS_DIAGRAM = {
  nodes: [
    { id: "decree", label: "Human Decree (PRODUCT.md)" },
    { id: "contract", label: "Agent Contract (AGENTS.md)" },
    { id: "mcp", label: "Rust MCP + Graft Context" },
    { id: "council", label: "Role Split (Claude + Codex)" },
    { id: "forge", label: "PixelLab + Depth-Anything-V2" },
    { id: "runner", label: "Sandbox Runner (No Auto-Push)" },
    { id: "verify", label: "757 Test Files + Playwright Axe" },
    { id: "shipped", label: "Pinned 40-char SHA Ledger" },
  ],
  edges: [
    { from: "decree", to: "contract" },
    { from: "contract", to: "mcp" },
    { from: "mcp", to: "council" },
    { from: "council", to: "forge" },
    { from: "council", to: "runner" },
    { from: "forge", to: "verify" },
    { from: "runner", to: "verify" },
    { from: "verify", to: "shipped" },
  ],
};

export default function AgentCommandPage() {
  const projects = getProjects();
  const profile = getProfile();
  const { A, B, C } = tiers();

  const practice: PracticeData = JSON.parse(
    readFileSync(path.join(process.cwd(), "content/practice.json"), "utf8"),
  );
  const journey: JourneyData = JSON.parse(
    readFileSync(path.join(process.cwd(), "content/journey.json"), "utf8"),
  );

  // Map repo name or slug to practice entry
  const practiceBySha = new Map<string, PracticeRepo>();
  for (const r of Object.values(practice.repos)) {
    practiceBySha.set(r.sha, r);
  }

  const totalPracticeFiles = Object.values(practice.repos).reduce((acc, r) => acc + r.files, 0);
  const totalPracticeTests = Object.values(practice.repos).reduce((acc, r) => acc + r.testFiles, 0);
  const totalProjectCommits = projects.reduce((acc, p) => acc + (p.repo?.totalCommits ?? 0), 0);

  // Build Isometric Monuments from real verified project JSONs
  const projectMonuments: IsoMonument[] = projects.map((p) => {
    const layout = COORDS[p.slug] ?? {
      x: 0,
      y: 0,
      h: 1.3,
      district: "systems" as IsoDistrict,
      short: p.title,
      stages: [1, 6],
    };
    const pr = p.repo ? practiceBySha.get(p.repo.pinnedSha) : undefined;
    const hero = heroAsset(p);
    const heroMedia = hero ? media(p.slug, hero.id) : undefined;
    const practiceDocs = pr
      ? Object.values(pr.found).filter((x): x is string => typeof x === "string")
      : [];

    return {
      slug: p.slug,
      accession: p.accession,
      title: p.title,
      shortTitle: layout.short,
      kind: p.kind,
      tier: p.tier,
      maturity: MATURITY[p.maturity],
      tagline: p.tagline,
      summary: p.summary,
      period: period(p),
      stack: p.stack,
      commits: p.repo?.totalCommits ?? 0,
      files: pr?.files ?? 0,
      testFiles: pr?.testFiles ?? 0,
      aiSummary: p.aiRole.summary,
      aiTools: p.aiRole.tools,
      practiceDocs,
      gridX: layout.x,
      gridY: layout.y,
      height: layout.h,
      district: layout.district,
      stages: layout.stages,
      image:
        hero && heroMedia
          ? {
              src: heroMedia.src,
              srcSet: heroMedia.srcSet,
              width: heroMedia.width,
              height: heroMedia.height,
              alt: hero.alt,
            }
          : null,
      href: p.tier !== "C" ? `/works/${p.slug}/` : null,
      repoUrl: p.repo?.url ?? null,
      pinnedSha: p.repo?.pinnedSha ?? null,
    };
  });

  // Add Central Agent Command Spire (0,0) + Enterprise CV Vault (2.0, 2.0)
  const coreMonument: IsoMonument = {
    slug: "agent-command-core",
    accession: "PK-2026-CMD",
    title: "Agent Command & Verification Core",
    shortTitle: "COMMAND CORE",
    kind: "ai",
    tier: "CORE",
    maturity: "Studio Harness",
    tagline:
      "Central orchestration hub governing Claude Code, Codex CLI, Rust MCP bridges, Graft context graphs, and deterministic test gates across 21 repositories.",
    summary:
      "Every repository in the studio connects to this discipline: explicit human decrees (PRODUCT.md, DESIGN.md), role-split agent guidance (AGENTS.md, CLAUDE.md, WORK_IN_PROGRESS.md), path-confined MCP tooling, and machine-checked verification.",
    period: "2020 to 2026",
    stack: [
      "Claude Code (Opus / Sonnet)",
      "Codex CLI",
      "Rust MCP (rmcp)",
      "Graft Context Graph",
      "Impeccable Design QA",
      "Depth-Anything-V2",
      "Playwright + Axe",
    ],
    commits: totalProjectCommits,
    files: totalPracticeFiles,
    testFiles: totalPracticeTests,
    aiSummary:
      "Directs specialized coding, review, security, and visual-generation agents across systems and games, with every claim pinned to a 40-character git SHA.",
    aiTools: [
      {
        name: "Multi-Agent Role Split",
        use: "Assigns UX/UI, core architecture, security review (Hermes), and status archiving to separate bounded agent sessions.",
      },
      {
        name: "Rust MCP & Graft Context",
        use: "Feeds exact symbol graphs and path-confined read/patch tools instead of blind token dumping.",
      },
      {
        name: "Deterministic Gate",
        use: "757 test files, verify-content.ts, secret scanning, and Playwright WCAG 2.2 AA checks before acceptance.",
      },
    ],
    practiceDocs: ["PRODUCT.md", "DESIGN.md", "AGENTS.md", "CLAUDE.md", "ARCHITECTURE.md", "VERIFICATION.md"],
    gridX: 0,
    gridY: 0,
    height: 2.45,
    district: "command",
    stages: [1, 2, 3, 4, 5, 6],
    image: null,
    href: "/lab/",
    repoUrl: SITE.github,
    pinnedSha: null,
  };

  const logisticsMonument: IsoMonument = {
    slug: "logistics-twin",
    accession: "PK-2026-NURI",
    title: "Autonomous Logistics Digital Twin (NuriTrack / REA)",
    shortTitle: "Logistics Twin 3D",
    kind: "ai",
    tier: "A",
    maturity: "Live Simulation",
    tagline:
      "3D multi-modal logistics control room reverse-engineered via REA: AI Interprets, Code Decides.",
    summary:
      "Full-scale real-time 3D simulation running React 19, Three.js, React Three Fiber, and Zustand. Orchestrates high-bay warehouse AMRs, high-speed cross-belt sorters, highway platooning trucks, Boeing 777F cargo freighters, container ships, and last-mile delivery drones across 7 journey stages.",
    period: "2026",
    stack: [
      "React 19",
      "Three.js 0.186",
      "@react-three/fiber",
      "@react-three/drei",
      "Zustand",
      "TypeScript",
      "Reverse Engineer Anything (REA)",
    ],
    commits: 48,
    files: 18,
    testFiles: 4,
    aiSummary:
      "Multi-agent autonomous logistics twin: natural-language AI routing constraints are evaluated by deterministic state machines and 60 FPS physics.",
    aiTools: [
      {
        name: "REA Architecture",
        use: "Reverse Engineer Anything analysis: 5 decoupled subsystems running on shared Zustand state bus.",
      },
      {
        name: "Zero-Re-render Bridge",
        use: "Zustand hook directly into Three.js useFrame loop to guarantee 60 FPS without React DOM re-renders.",
      },
      {
        name: "Deterministic State Gate",
        use: "Strict safety invariants: AMR obstacle avoidance, gantry clearance, and cryptographic proof-of-delivery.",
      },
    ],
    practiceDocs: ["PRODUCT.md", "DESIGN.md", "AGENTS.md", "ARCHITECTURE.md"],
    gridX: -1.2,
    gridY: -0.8,
    height: 2.15,
    district: "command",
    stages: [1, 2, 3, 4, 5, 6],
    image: null,
    href: "#logistics-stage",
    repoUrl: SITE.github,
    pinnedSha: null,
  };

  const enterpriseVaultMonument: IsoMonument = {
    slug: "enterprise-cv-vault",
    accession: "PK-2020-CV5",
    title: "Enterprise & Industrial Archive (PTT, SCG, SIPH, ETRAN, AOT)",
    shortTitle: "Enterprise Vault (5+)",
    kind: "vault",
    tier: "VAULT",
    maturity: "Enterprise / Commercial",
    tagline:
      "Five enterprise and hardware-integrated deliveries named on the author's published CV, plus additional private commercial systems available for live discussion.",
    summary:
      "Includes PTT UI concept, SCG web management, SIPH auto dispense machine, ETRAN web management, and AOT kiosk, alongside additional private engineering work that cannot be placed in public git repositories.",
    period: "Published CV Record",
    stack: [
      "React / Vue JS/TS",
      "Node.js",
      "Go",
      "C# .NET Core",
      "Flutter (Dart)",
      "SQL / MySQL",
      "Docker",
      "Hardware / Kiosk / Dispenser",
    ],
    commits: 0,
    files: 0,
    testFiles: 0,
    aiSummary:
      "Commercial and client works are kept strictly confidential per professional obligations; architectural walkthroughs and live discussions are available upon direct inquiry.",
    aiTools: profile.cvProjectLabels.map((label) => ({
      name: label,
      use: "Named on the published CV ('Experience & Projects'). Reach out directly to discuss the engineering context.",
    })),
    practiceDocs: ["Published CV (PDF)"],
    gridX: 2.0,
    gridY: 2.0,
    height: 1.92,
    district: "vault",
    stages: [1, 5, 6],
    image: null,
    href: null,
    repoUrl: null,
    pinnedSha: null,
  };

  const allMonuments: IsoMonument[] = [
    coreMonument,
    logisticsMonument,
    ...projectMonuments,
    enterpriseVaultMonument,
  ];

  const aiEnabledProjects = projects.filter(
    (p) => p.tier !== "C" && (p.aiRole.tools.length > 0 || p.kind === "ai" || p.slug === "pvp-td" || p.slug === "room-25"),
  );
  const xrayProject = projects.find((p) => p.slug === "codescape") ?? projects.find((p) => p.slug === "cursed-market")!;
  const xrayHero = heroAsset(xrayProject);
  const xrayMedia = xrayHero ? media(xrayProject.slug, xrayHero.id) : undefined;

  return (
    <>
      {/* ───────── ROOM 1: 16:9 ISOMETRIC AGENT COMMAND HERO & STUDIO ───────── */}
      <Room id="lab" label="Agent command">
        <div className="wall">
          {/* Interactive 16:9 3D/2.5D Isometric Hero World with Overlaid Clean UI */}
          <div style={{ gridColumn: "1 / -1" }}>
            <IsometricAgentWorld
              monuments={allMonuments}
              totalCommits={totalProjectCommits}
              totalFiles={totalPracticeFiles}
              totalTests={totalPracticeTests}
              email={SITE.email}
            />
          </div>

          {/* 4 Monumental Studio Telemetry Plinths */}
          <dl className="iso-kpi-strip" style={{ gridColumn: "1 / -1" }} aria-label="Verified studio scale">
            <div className="iso-kpi">
              <dt>Catalogued Works &amp; Vaults</dt>
              <dd className="tabular">{projects.length} repos + {profile.cvProjectLabels.length} CV</dd>
              <span>{A.length} Tier A case studies · {B.length} Tier B · {C.length} private crates · plus more on inquiry</span>
            </div>
            <div className="iso-kpi">
              <dt>AI-Directed Repositories</dt>
              <dd className="tabular">{aiEnabledProjects.length} public works</dd>
              <span>Governed via AGENTS.md, CLAUDE.md, Rust MCP, Graft, PixelLab &amp; Depth-Anything-V2</span>
            </div>
            <div className="iso-kpi">
              <dt>Audited Files &amp; Test Suites</dt>
              <dd className="tabular">{totalPracticeTests} test files</dd>
              <span>Across {totalPracticeFiles.toLocaleString("en-US")} source files verified in content/practice.json</span>
            </div>
            <div className="iso-kpi">
              <dt>GitHub Account Record</dt>
              <dd className="tabular">{journey.totals.counted} repositories</dd>
              <span>{journey.totals.public} public + {journey.totals.private} private counted ({totalProjectCommits} pinned commits here)</span>
            </div>
          </dl>
        </div>
      </Room>

      {/* ───────── ROOM 2: THE AGENTIC HARNESS & X-RAY ───────── */}
      <Room id="works" label="The agentic harness">
        <div className="wall" id="harness-xray">
          <div style={{ gridColumn: "1 / span 7" }}>
            <h2 className="vinyl vinyl--l">Why my agents ship working systems</h2>
            <p className="wall-text" style={{ marginTop: "var(--s-4)", maxInlineSize: "44ch" }}>
              Prompting alone produces brittle demos. Across these repositories, agents operate inside a strict engineering
              harness: human-authored contracts, path-confined Rust MCP bridges, role-split councils, and deterministic test gates.
            </p>
          </div>

          <div style={{ gridColumn: "8 / span 5", alignSelf: "end" }}>
            <WallLabel
              accession="PK-2026-HRN"
              title="Harness vs. Unbounded Prompting"
              year="2026"
              fields={[
                { k: "Control plane", v: "AI Kingdom (PK-2026-004): Decree -> Council -> Work Order -> Sandbox Runner -> Accept & Learn." },
                { k: "Bridge", v: "ChatGPT MCP (PK-2026-013): 9 path-confined Rust tools (exact-match patch, TOML check runner)." },
                { k: "Design & QA", v: "Impeccable surface contracts, Ego Browser verification, and Playwright + Axe WCAG 2.2 AA suites." },
              ]}
              label="Harness summary"
            />
          </div>

          {/* Featured Live 3D Logistics Simulation Twin Banner */}
          <div style={{ gridColumn: "1 / -1", background: "oklch(0.12 0.016 262)", border: "1px solid rgba(124, 245, 230, 0.35)", borderRadius: "2px", padding: "var(--s-4)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--s-3)", marginTop: "var(--s-4)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7cf5e6", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7cf5e6", boxShadow: "0 0 6px #7cf5e6" }} />
                <span>EXHIBITED BELOW IN ROOM 3 · 3D TWIN</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-vinyl)", fontSize: "1.25rem", color: "var(--vinyl)", margin: "4px 0 2px" }}>
                NuriTrack 3D Autonomous Logistics Twin (REA Architecture)
              </h3>
              <p style={{ color: "var(--vinyl-soft)", fontSize: "0.875rem", margin: 0 }}>
                React 19, Three.js, React Three Fiber, TypeScript &amp; Zustand simulation of multi-modal warehouse AMRs, cross-belt sorters, and drone deliveries.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
              <a className="btn" href="#logistics-stage">
                Scroll to 3D Stage ↓
              </a>
              <Link className="btn btn--ghost" href="/logistics/">
                Full Screen View <IconArrow />
              </Link>
            </div>
          </div>

          {/* Side-by-side Discipline Comparison + Signature X-Ray Blueprint Lens */}
          <div className="harness-surface" style={{ gridColumn: "1 / -1" }}>
            <div className="harness-surface__col">
              <p className="harness-surface__tag">WITHOUT A HARNESS (COMMON FAILURE MODE)</p>
              <h3>Unbounded Vibe-Coding</h3>
              <ul className="caveats">
                <li>Whole-repository context dumps burn tokens and hallucinate module boundaries.</li>
                <li>Single-agent sessions overwrite UI and backend state simultaneously without arbitration.</li>
                <li>Unverified AI patches push straight to main without deterministic test or accessibility gates.</li>
                <li>Generated art ships as flat, unlabelled files with no shader integration or provenance record.</li>
              </ul>
            </div>
            <div className="harness-surface__col harness-surface__col--governed">
              <p className="harness-surface__tag">P. KANYAPAN&apos;S STUDIO HARNESS (VERIFIED IN GIT)</p>
              <h3>Contract-Bound Agent Engineering</h3>
              <ul className="harness-checks">
                <li>
                  <strong>Explicit Context Binding:</strong> <code>PRODUCT.md</code>, <code>DESIGN.md</code>, <code>AGENTS.md</code>,
                  and <code>CLAUDE.md</code> lock scope before execution.
                </li>
                <li>
                  <strong>Precision Tooling:</strong> Rust <code>mcp-bridge</code> and <code>Graft</code> symbol graphs confine edits to
                  registered paths and exact-match diffs.
                </li>
                <li>
                  <strong>Multi-Agent Role Split:</strong> <code>WORK_IN_PROGRESS.md</code> and Grand Vizier councils separate Codex (UX/UI),
                  Claude Opus/Sonnet (Core), and Hermes (Security).
                </li>
                <li>
                  <strong>Hard Verification Gate:</strong> Sandboxed runners refuse auto-push; 757 test files + Playwright &amp; Axe verify
                  the build before human acceptance.
                </li>
              </ul>
            </div>
          </div>

          {xrayHero && xrayMedia && (
            <div style={{ gridColumn: "1 / -1" }}>
              <XRay
                surfaceLabel="Shipped Surface (CodeScape)"
                beneathLabel="Agent Harness Blueprint"
                initial={45}
                surface={
                  /* eslint-disable-next-line @next/next/no-img-element -- static export */
                  <img
                    src={xrayMedia.src}
                    srcSet={xrayMedia.srcSet}
                    sizes="(max-width: 52rem) 92vw, 84vw"
                    width={xrayMedia.width}
                    height={xrayMedia.height}
                    alt={xrayHero.alt}
                    loading="lazy"
                    decoding="async"
                  />
                }
                beneath={<Blueprint diagram={HARNESS_DIAGRAM} title="Studio Agent Orchestration Harness" />}
              />
            </div>
          )}

          {/* Paper Catalogue Sheet: Full 15-Repository Agent Tooling & Verification Matrix */}
          <section className="paper" style={{ gridColumn: "1 / -1" }} aria-labelledby="agent-ledger-heading">
            <h3 id="agent-ledger-heading" className="paper__h">
              Verified Agent Tooling &amp; Governance Ledger ({aiEnabledProjects.length} Public Works)
            </h3>
            <p className="measure" style={{ marginBottom: "var(--s-5)" }}>
              Every tool listed below is recorded in the project&apos;s repository at its pinned commit—in commit trailers, checked-in agent
              instruction files, prompt histories, or asset pipelines. Nothing is claimed from memory.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="practice">
                <thead>
                  <tr>
                    <th scope="col">Work</th>
                    <th scope="col">Domain</th>
                    <th scope="col">Documented AI &amp; Agent Tools</th>
                    <th scope="col">Contracts in Git</th>
                    <th scope="col">Tests</th>
                    <th scope="col">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {aiEnabledProjects.map((p) => {
                    const pr = p.repo ? practiceBySha.get(p.repo.pinnedSha) : undefined;
                    const docs = pr
                      ? Object.values(pr.found)
                          .filter((x): x is string => typeof x === "string")
                          .map((f) => f.split("/").pop())
                      : [];
                    const toolNames = p.aiRole.tools.length
                      ? p.aiRole.tools.map((t) => t.name).join(" · ")
                      : "AGENTS.md / REVIEW_PLAN.md brief";
                    return (
                      <tr key={p.slug}>
                        <th scope="row">
                          <Link href={`/works/${p.slug}/`}>{p.title}</Link>{" "}
                          <span className="practice__sha">{p.accession}</span>
                        </th>
                        <td>{KIND[p.kind]}</td>
                        <td style={{ whiteSpace: "normal", minWidth: "18rem", maxWidth: "28rem" }}>{toolNames}</td>
                        <td>{docs.length > 0 ? docs.join(", ") : "Repo docs"}</td>
                        <td className="tabular">{pr ? pr.testFiles : "–"}</td>
                        <td>
                          <Link href={`/works/${p.slug}/`}>
                            Case study {p.repo ? `(@${sha7(p.repo.pinnedSha)})` : ""}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Room>

      {/* ───────── ROOM 3: AUTONOMOUS LOGISTICS DIGITAL TWIN (REA ARCHITECTURE) ───────── */}
      <Room id="lab" label="3D Logistics Twin">
        <div className="wall" id="logistics-stage">
          <div style={{ gridColumn: "1 / span 8" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#7cf5e6",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "var(--s-2)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#7cf5e6",
                  boxShadow: "0 0 8px #7cf5e6",
                }}
              />
              <span>LIVE MULTI-MODAL REA SIMULATION</span>
            </div>
            <h2 className="vinyl vinyl--xl">Autonomous Logistics Digital Twin</h2>
            <p className="wall-text" style={{ marginTop: "var(--s-3)" }}>
              A high-performance 3D multi-modal supply chain control room reverse-engineered via{" "}
              <strong>REA (Reverse Engineer Anything)</strong> and inspired by{" "}
              <strong>NuriTrack</strong> (<em>바이브 코딩 — 김동학</em>).
            </p>
            <p className="wall-text wall-text--soft" style={{ marginTop: "var(--s-2)" }}>
              Embodying the studio decree: <em>&ldquo;AI Interprets, Code Decides&rdquo;</em>. Autonomous
              agent routing constraints are deterministically verified across high-bay AMR retrieval,
              cross-belt sorters, highway line-hauls, air cargo freighters, container ships, and last-mile
              hexacopter drones.
            </p>
            <div className="btn-row" style={{ marginTop: "var(--s-4)" }}>
              <a
                className="btn btn--ghost"
                href="https://www.youtube.com/watch?v=Lt8XH8HJU_M"
                target="_blank"
                rel="noreferrer"
              >
                NuriTrack Reference Video <IconExternal />
              </a>
              <Link className="btn btn--ghost" href="/logistics/">
                Dedicated Full-Screen View <IconArrow />
              </Link>
            </div>
          </div>

          <div style={{ gridColumn: "9 / span 4", alignSelf: "end" }}>
            <WallLabel
              accession="PK-2026-NURI"
              title="NuriTrack Logistics Twin"
              year="2026"
              fields={[
                { k: "Medium", v: "React 19, Three.js, React Three Fiber, Zustand" },
                { k: "Methodology", v: "REA (Reverse Engineer Anything) Architecture Pass" },
                { k: "Core Rule", v: "AI Interprets, Code Decides (TypeSafe State Bus)" },
                { k: "Status", v: "Active Interactive Simulation / 60 FPS Digital Twin" },
                { k: "Original Demo", v: "NuriTrack by 김동학 (바이브 코딩)" },
              ]}
              chips={
                <>
                  <span className="chip chip--live">Active 3D Twin</span>
                  <Chip level="source" href="https://www.youtube.com/watch?v=Lt8XH8HJU_M">
                    NuriTrack Demo
                  </Chip>
                </>
              }
              label="Digital Twin Wall Label"
            />
          </div>

          {/* 3D Multi-modal Interactive Simulation Stage */}
          <div style={{ gridColumn: "1 / -1", marginTop: "var(--s-5)" }}>
            <LogisticsStage />
          </div>

          {/* Architectural Breakdown Grid */}
          <div
            style={{
              gridColumn: "1 / -1",
              marginTop: "var(--s-5)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--s-4)",
            }}
          >
            <div className="crate" style={{ padding: "var(--s-4)" }}>
              <p className="label__acc" style={{ color: "#7cf5e6" }}>
                01 · MULTI-FACILITY TOPOLOGY
              </p>
              <h4
                style={{
                  fontFamily: "var(--font-vinyl)",
                  fontSize: "1.0625rem",
                  color: "var(--vinyl)",
                  margin: "4px 0 8px",
                }}
              >
                5 Connected Logistics Nodes
              </h4>
              <p
                style={{
                  color: "var(--vinyl-soft)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Icheon Automated Warehouse, Gonjiam Cross-Belt Mega Hub, Arterial Highway Corridor, Incheon
                Aerotropolis &amp; Container Port, and Bangkok Urban Smart Locker.
              </p>
            </div>
            <div className="crate" style={{ padding: "var(--s-4)" }}>
              <p className="label__acc" style={{ color: "#38bdf8" }}>
                02 · AUTONOMOUS MACHINERY AGENTS
              </p>
              <h4
                style={{
                  fontFamily: "var(--font-vinyl)",
                  fontSize: "1.0625rem",
                  color: "var(--vinyl)",
                  margin: "4px 0 8px",
                }}
              >
                AMRs, Semis &amp; AeroDrones
              </h4>
              <p
                style={{
                  color: "var(--vinyl-soft)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Lidar-guided AMR grid retrieval, platooning line-haul semi trucks on oval circuit, Boeing
                777F freighter cross-docking, and hexacopters with altitude stabilization.
              </p>
            </div>
            <div className="crate" style={{ padding: "var(--s-4)" }}>
              <p className="label__acc" style={{ color: "#fbbf24" }}>
                03 · ZERO-RE-RENDER STATE BRIDGE
              </p>
              <h4
                style={{
                  fontFamily: "var(--font-vinyl)",
                  fontSize: "1.0625rem",
                  color: "var(--vinyl)",
                  margin: "4px 0 8px",
                }}
              >
                Zustand 60 FPS R3F Loop
              </h4>
              <p
                style={{
                  color: "var(--vinyl-soft)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Dynamic camera director, real-time weather ecosystem (Rain/Snow/Autumn), and Day/Sunset/Cyber
                Night lighting cycle without cascading React DOM re-renders.
              </p>
            </div>
          </div>
        </div>
      </Room>

      {/* ───────── ROOM 4: BEYOND THE PUBLIC WALL (CARTIER VAULT & INQUIRY DESK) ───────── */}
      <Room id="storage" label="Beyond the public wall">
        <div className="wall">
          <div style={{ gridColumn: "1 / span 8" }}>
            <p className="iso-eyebrow">PRIVATE ARCHIVE &amp; COMMISSIONING SALON</p>
            <h2 className="vinyl vinyl--l">Beyond the public wall</h2>
            <p className="wall-text" style={{ marginTop: "var(--s-4)", maxInlineSize: "46ch" }}>
              The 17 public repositories hanging in this exhibition are only the open-source surface. I have built many more
              systems—commercial backend services in Go and Rust, hospital and airport hardware integrations, enterprise management
              portals, and internal AI agent harnesses. Because client and commercial repositories stay private, I invite you to
              reach out directly to ask questions or request a live architectural walkthrough.
            </p>
          </div>

          <div style={{ gridColumn: "9 / span 4", alignSelf: "end" }}>
            <WallLabel
              accession="PK-2026-VLT"
              title="Why works are held in the vault"
              year="2020–2026"
              fields={[
                { k: "Policy", v: "Client confidentiality and commercial NDAs are strictly honoured: no private source code, internal URLs, or screenshots are leaked." },
                { k: "What you can ask", v: "Architecture decisions, agent orchestration patterns, hardware serial/MQTT protocols, or a guided live demo." },
                { k: "Direct contact", v: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> },
              ]}
              chips={
                <span className="chip chip--private">
                  <IconPrivate />
                  Walkthrough on request
                </span>
              }
              label="Vault policy"
            />
          </div>

          {/* 3 High-Craft Archival Vault Cases */}
          <div className="vault-cases" style={{ gridColumn: "1 / -1" }}>
            <article className="crate vault-case">
              <p className="label__acc">VAULT CASE I · PRIVATE REPOSITORIES IN STORAGE</p>
              <h3 className="crate__title">Redacted Systems &amp; Games ({C.length + 1} Works)</h3>
              <p className="crate__meta">Verified from GitHub metadata &amp; live deployment records</p>
              <ul className="vault-list">
                {C.map((c) => (
                  <li key={c.slug}>
                    <strong>{c.title}</strong> ({c.accession}) — {c.stack.join(", ")}. {c.contribution}
                  </li>
                ))}
                <li>
                  <strong>The Patch Press</strong> (PK-2026-016) — Live custom-domain web deployment; source repository kept private.
                </li>
              </ul>
              <p className="crate__seal">
                <span className="chip chip--private">
                  <IconPrivate />
                  Not on public view · Ask for architecture details
                </span>
              </p>
            </article>

            <article className="crate vault-case">
              <p className="label__acc">VAULT CASE II · ENTERPRISE &amp; HARDWARE RECORD</p>
              <h3 className="crate__title">Enterprise &amp; Kiosk Deliveries ({profile.cvProjectLabels.length} Named on CV)</h3>
              <p className="crate__meta">Source: {profile.cvSource}</p>
              <ul className="vault-list">
                <li>
                  <strong>PTT UI concept</strong> — Enterprise user-interface concept and interactive front-end system design.
                </li>
                <li>
                  <strong>SCG web management</strong> — Industrial web management application and workflow portal.
                </li>
                <li>
                  <strong>SIPH auto dispense machine</strong> — Hospital automated dispensing machine software and hardware integration.
                </li>
                <li>
                  <strong>ETRAN web management</strong> — Electric fleet and operations web management platform.
                </li>
                <li>
                  <strong>AOT kiosk</strong> — Airport terminal interactive passenger kiosk interface and system integration.
                </li>
              </ul>
              <p className="crate__seal">
                <span className="chip chip--private">
                  <IconPrivate />
                  Listed as written on CV · Discuss in interview
                </span>
              </p>
            </article>

            <article className="crate vault-case">
              <p className="label__acc">VAULT CASE III · BESPOKE AGENT HARNESSES &amp; R&amp;D</p>
              <h3 className="crate__title">Custom Agent Workflows &amp; Full-Stack Capabilities</h3>
              <p className="crate__meta">Available for consulting, team enablement, or engineering roles</p>
              <ul className="vault-list">
                <li>
                  <strong>Multi-Agent Control Planes:</strong> State-machine orchestration, provider fallback routing, cost accounting, and human-gated review loops.
                </li>
                <li>
                  <strong>Local MCP &amp; Context Tooling:</strong> Rust and TypeScript Model Context Protocol servers confining agents to safe, deterministic operations.
                </li>
                <li>
                  <strong>Hardware &amp; Real-Time Protocols:</strong> RS-232 serial, IPP print gateways, MQTT, NATS JetStream, and authoritative WebSocket game servers.
                </li>
                <li>
                  <strong>AI-Assisted Visual &amp; WebGL Pipelines:</strong> Depth-Anything-V2 local inference, raw WebGL shaders, and automated Playwright/Axe verification.
                </li>
              </ul>
              <p className="crate__seal">
                <span className="chip chip--ai">Ready for technical walkthrough &amp; live Q&amp;A</span>
              </p>
            </article>
          </div>

          {/* Interactive Bilingual Inquiry & Walkthrough Composer */}
          <div style={{ gridColumn: "1 / -1" }}>
            <VaultInquiryDesk email={SITE.email} github={SITE.github} city={SITE.city} />
          </div>

          <div style={{ gridColumn: "1 / span 6" }}>
            <Doorway to="works" hint="Inspect every public case study and its evidence ledger." />
          </div>
        </div>
      </Room>
    </>
  );
}
