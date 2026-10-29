import type { Metadata } from "next";
import Link from "next/link";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Room } from "@/components/Room";
import { WallLabel } from "@/components/WallLabel";
import type { ReactNode } from "react";
import { Blueprint } from "@/components/Blueprint";
import { XRay } from "@/components/XRay";
import { Doorway } from "@/components/Doorway";
import { Chip } from "@/components/Evidence";
import { IconArrow, IconExternal, IconPrivate } from "@/components/icons";
import { FLEET, SITES } from "@/data/logistics/seed";
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
  title: "Agent command",
  description:
    "A walk through how Phatcharadanai Kanyapan directs AI agents: the island of verified works, the harness that keeps agents honest, a live logistics twin, and the private works available on request.",
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
    { id: "verify", label: "Test Gate + Playwright Axe" },
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

  // Logistics twin facts, read from this repository rather than written by hand.
  const countIn = (dir: string, re: RegExp) => readdirSync(path.join(process.cwd(), dir)).filter((f) => re.test(f)).length;
  const fleetTotals = Object.values(FLEET).reduce((t, [tr, fl, am]) => [t[0] + tr, t[1] + fl, t[2] + am], [0, 0, 0]);
  const twin = {
    sites: SITES.length,
    trucks: fleetTotals[0]!,
    forklifts: fleetTotals[1]!,
    amrs: fleetTotals[2]!,
    files: countIn("src/components/logistics", /\.tsx?$/) + countIn("src/data/logistics", /\.ts$/),
    tests: countIn("tests/unit", /^logistics.*\.test\.ts$/),
  };

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
        use: `${totalPracticeTests} test files, verify-content.ts, secret scanning, and Playwright WCAG 2.2 AA checks before acceptance.`,
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
    title: "Logistics Digital Twin (NuriTrack study)",
    shortTitle: "Logistics Twin 3D",
    kind: "ai",
    tier: "A",
    maturity: "Live Simulation",
    tagline: "A rebuild of the NuriTrack demo: three sites, one seeded simulation, and a control room that reads every number from it.",
    summary: `Built with React 19, Three.js, React Three Fiber, drei and Zustand. ${twin.sites} sites, ${twin.trucks} trucks, ${twin.forklifts} forklifts and ${twin.amrs} AMRs run on a deterministic, seeded simulation; dock assignment, yard holds and late flags are plain rules logged as they happen.`,
    period: "2026",
    stack: ["React 19", "Three.js", "@react-three/fiber", "@react-three/drei", "Zustand", "TypeScript"],
    commits: 0,
    files: twin.files,
    testFiles: twin.tests,
    aiSummary:
      "Studied from the NuriTrack walkthrough video and built with an AI coding agent working in reviewed steps: data model first, the 3D scene as a view of it, then inspection and the control room.",
    aiTools: [
      {
        name: "Data first, 3D as a view",
        use: "Sites, docks, vehicles and parcels are typed records; every object in the scene is placed from them.",
      },
      {
        name: "Deterministic simulation",
        use: "A seeded RNG and pure step function: the same seed replays the same day, checked by unit tests.",
      },
      {
        name: "Frame loop outside React",
        use: "Vehicle motion runs in useFrame; React re-renders only on the two-second simulation tick.",
      },
    ],
    practiceDocs: ["docs/superpowers/plans/2026-10-29-nuritrack-3d-upgrade.md"],
    gridX: -1.2,
    gridY: -0.8,
    height: 2.15,
    district: "command",
    stages: [1, 2, 3, 4, 5, 6],
    image: null,
    href: "#twin",
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
      {/* Room 1: the island of works */}
      <Room id="lab" label="Agent command" className="walk">
        <Thread />
        <div className="wall">
          <header className="walk-head">
            <h1 className="vinyl walk-head__title">Agent command</h1>
            <p className="wall-text walk-head__thesis">
              I direct AI agents inside a harness of written contracts, confined tools and test gates. Each claim on these walls is
              tied to the evidence behind it.
            </p>
          </header>

          <div className="walk-work">
            <IsometricAgentWorld
              monuments={allMonuments}
              totalCommits={totalProjectCommits}
              totalFiles={totalPracticeFiles}
              totalTests={totalPracticeTests}
              email={SITE.email}
            />
          </div>

          <ul className="claims" aria-label="What the island holds">
            <Claim href="/works/" proof="Every case study">
              <b className="tabular">{projects.length}</b> repositories hang on this island, and {profile.cvProjectLabels.length} more deliveries are
              named on the CV.
            </Claim>
            <Claim href="#ledger" proof="Tooling ledger">
              <b className="tabular">{aiEnabledProjects.length}</b> public works were built with AI agents; the ledger lists the tools or agent brief each
              repository records.
            </Claim>
            <Claim href="#ledger" proof="Test counts per work">
              <b className="tabular">{totalPracticeTests}</b> test files across {totalPracticeFiles.toLocaleString("en-US")} source files, counted at
              each pinned commit.
            </Claim>
            <Claim href={SITE.github} proof="GitHub profile" external>
              <b className="tabular">{journey.totals.counted}</b> repositories on the account: {journey.totals.public} public, {journey.totals.private} private.
            </Claim>
          </ul>
        </div>
      </Room>

      {/* Room 2: the harness */}
      <Room id="works" label="The agentic harness" className="walk">
        <Thread />
        <div className="wall" id="harness">
          <div className="walk-statement">
            <h2 className="vinyl vinyl--l">Why my agents ship working systems</h2>
            <p className="wall-text">
              Prompting alone produces brittle demos. Here, agents work inside a harness: human-written contracts, path-confined Rust MCP
              tools, separate roles for separate agents, and test gates no patch skips.
            </p>
          </div>
          <div className="walk-label">
            <WallLabel
              accession="PK-2026-HRN"
              title="The harness, in practice"
              year="2026"
              fields={[
                { k: "Control plane", v: "AI Kingdom (PK-2026-004): Decree, Council, Work Order, Sandbox Runner, Accept & Learn." },
                { k: "Bridge", v: "ChatGPT MCP (PK-2026-013): 9 path-confined Rust tools, exact-match patching, a TOML check runner." },
                { k: "Design & QA", v: "Impeccable surface contracts, browser verification, Playwright + Axe WCAG 2.2 AA suites." },
              ]}
              label="Harness summary"
            />
          </div>

          {xrayHero && xrayMedia && (
            <div className="walk-work">
              <XRay
                surfaceLabel="Shipped surface (CodeScape)"
                beneathLabel="Agent harness blueprint"
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
                beneath={<Blueprint diagram={HARNESS_DIAGRAM} title="Studio agent orchestration harness" />}
              />
            </div>
          )}

          <ul className="claims" aria-label="How the harness holds agents to account">
            <Claim href="/works/chatgpt-mcp/" proof="ChatGPT MCP case study">
              Agents edit through path-confined tools and exact-match diffs, not whole-repository dumps.
            </Claim>
            <Claim href="/works/ai-kingdom/" proof="AI Kingdom case study">
              A sandbox runner refuses to push; a person accepts or rejects each work order.
            </Claim>
            <Claim href="#ledger" proof="Ledger below">
              <code>PRODUCT.md</code>, <code>DESIGN.md</code>, <code>AGENTS.md</code> and <code>CLAUDE.md</code> fix scope before an agent writes a line.
            </Claim>
          </ul>

          <section className="paper walk-compare" aria-labelledby="compare-heading">
            <h3 id="compare-heading" className="paper__h">With and without a harness</h3>
            <div className="walk-compare__cols">
              <div>
                <h4>Unbounded prompting</h4>
                <ul className="caveats">
                  <li>Whole-repository context dumps burn tokens and invent module boundaries.</li>
                  <li>One agent rewrites UI and backend at once, with nobody arbitrating.</li>
                  <li>Unverified patches land on main without test or accessibility gates.</li>
                  <li>Generated art ships as unlabelled files with no provenance.</li>
                </ul>
              </div>
              <div>
                <h4>Contract-bound agents</h4>
                <ul className="harness-checks">
                  <li><strong>Context is written down.</strong> Product, design and agent contracts are checked into each repository.</li>
                  <li><strong>Tools are confined.</strong> Rust MCP bridges and Graft symbol graphs limit edits to registered paths.</li>
                  <li><strong>Roles are split.</strong> <code>WORK_IN_PROGRESS.md</code> keeps UX, core and security work in separate sessions.</li>
                  <li><strong>The gate is hard.</strong> {totalPracticeTests} test files plus Playwright and Axe run before a person accepts.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="paper walk-ledger" id="ledger" aria-labelledby="ledger-heading">
            <h3 id="ledger-heading" className="paper__h">Agent tooling ledger: {aiEnabledProjects.length} public works</h3>
            <p className="measure">
              Every tool below is recorded in the project&apos;s repository at its pinned commit: commit trailers, checked-in agent
              instructions, prompt histories or asset pipelines. Nothing is claimed from memory.
            </p>
            <div className="walk-ledger__scroll">
              <table className="practice">
                <thead>
                  <tr>
                    <th scope="col">Work</th>
                    <th scope="col">Domain</th>
                    <th scope="col">Documented AI &amp; agent tools</th>
                    <th scope="col">Contracts in git</th>
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
                          <Link href={`/works/${p.slug}/`}>{p.title}</Link> <span className="practice__sha">{p.accession}</span>
                        </th>
                        <td>{KIND[p.kind]}</td>
                        <td className="walk-ledger__tools">{toolNames}</td>
                        <td>{docs.length > 0 ? docs.join(", ") : "Repo docs"}</td>
                        <td className="tabular">{pr ? pr.testFiles : "–"}</td>
                        <td>
                          <Link href={`/works/${p.slug}/`}>Case study {p.repo ? `(@${sha7(p.repo.pinnedSha)})` : ""}</Link>
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

      {/* Room 3: the logistics twin */}
      <Room id="studio" label="Logistics twin" className="walk">
        <Thread />
        <div className="wall" id="twin">
          <div className="walk-statement">
            <h2 className="vinyl vinyl--l">The logistics twin</h2>
            <p className="wall-text">
              A rebuild of the NuriTrack demo, studied from its walkthrough video. Pick a site, follow a truck from the gate to a dock,
              and read the rule log: every decision in it is plain code, made by a simulation that replays the same way from the same seed.
            </p>
          </div>
          <div className="walk-label">
            <WallLabel
              accession="PK-2026-NURI"
              title="Logistics twin"
              year="2026"
              fields={[
                { k: "Medium", v: "React 19, Three.js, React Three Fiber, drei, Zustand" },
                { k: "Scope", v: `${twin.sites} sites, ${twin.trucks} trucks, ${twin.forklifts} forklifts, ${twin.amrs} AMRs` },
                { k: "Simulation", v: `Seeded and deterministic; ${twin.tests} unit test files` },
                { k: "After", v: "NuriTrack by 김동학 (바이브 코딩)" },
              ]}
              chips={
                <Chip level="source" href="https://www.youtube.com/watch?v=Lt8XH8HJU_M">
                  Reference video
                </Chip>
              }
              label="Logistics twin label"
            />
          </div>

          <div className="walk-work walk-work--bleed">
            <LogisticsStage />
          </div>

          <ul className="claims" aria-label="What the twin proves">
            <Claim href="/logistics/" proof="Full-screen twin">
              The 3D scene is a view of typed records: sites, docks, vehicles and parcels. Nothing is placed by hand.
            </Claim>
            <Claim href="/logistics/" proof="Rule log, full screen">
              Dock assignments, yard holds and late flags are logged as the rules make them, with the simulation clock.
            </Claim>
            <Claim href="https://www.youtube.com/watch?v=Lt8XH8HJU_M" proof="NuriTrack walkthrough" external>
              Rebuilt after the original NuriTrack demo, from its walkthrough video.
            </Claim>
          </ul>
        </div>
      </Room>

      {/* Room 4: the vault */}
      <Room id="storage" label="Beyond the public wall" className="walk">
        <Thread />
        <div className="wall" id="vault">
          <div className="walk-statement">
            <h2 className="vinyl vinyl--l">Beyond the public wall</h2>
            <p className="wall-text">
              The {A.length + B.length} public works on this island are the open part. The rest are commercial backends in Go and Rust,
              hospital and airport hardware integrations, enterprise portals and internal agent harnesses, and they stay private. Ask, and
              I will walk you through the architecture.
            </p>
          </div>
          <div className="walk-label">
            <WallLabel
              accession="PK-2026-VLT"
              title="Why works are held in the vault"
              year="2020–2026"
              fields={[
                { k: "Policy", v: "Client confidentiality is kept: no private source, internal URLs or screenshots." },
                { k: "What you can ask", v: "Architecture decisions, agent orchestration, hardware serial and MQTT protocols, or a live demo." },
                { k: "Contact", v: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> },
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

          <div className="vault-cases walk-shelf">
            <article className="crate vault-case">
              <h3 className="crate__title">Private systems and games ({C.length + 1})</h3>
              <p className="crate__meta">From GitHub metadata and deployment records</p>
              <ul className="vault-list">
                {C.map((c) => (
                  <li key={c.slug}>
                    <strong>{c.title}</strong> ({c.accession}): {c.stack.join(", ")}. {c.contribution}
                  </li>
                ))}
                <li>
                  <strong>The Patch Press</strong> (PK-2026-016): a live custom-domain site; the source stays private.
                </li>
              </ul>
              <p className="crate__seal">
                <span className="chip chip--private">
                  <IconPrivate />
                  Not on view · ask for the architecture
                </span>
              </p>
            </article>

            <article className="crate vault-case">
              <h3 className="crate__title">Enterprise and kiosk work ({profile.cvProjectLabels.length} on the CV)</h3>
              <p className="crate__meta">Source: {profile.cvSource}</p>
              <ul className="vault-list">
                {profile.cvProjectLabels.map((label) => (
                  <li key={label}>
                    <strong>{label}</strong>
                  </li>
                ))}
              </ul>
              <p className="crate__seal">
                <span className="chip chip--private">
                  <IconPrivate />
                  As written on the CV · discuss in interview
                </span>
              </p>
            </article>

            <article className="crate vault-case">
              <h3 className="crate__title">Agent harnesses and full-stack work</h3>
              <p className="crate__meta">For consulting, team enablement or engineering roles</p>
              <ul className="vault-list">
                <li><strong>Multi-agent control planes:</strong> state-machine orchestration, provider fallback, cost accounting, human-gated review.</li>
                <li><strong>Local MCP and context tooling:</strong> Rust and TypeScript servers that confine agents to safe operations.</li>
                <li><strong>Hardware and real-time protocols:</strong> RS-232 serial, IPP print gateways, MQTT, NATS JetStream, authoritative WebSocket game servers.</li>
                <li><strong>AI-assisted visual pipelines:</strong> local Depth-Anything-V2, raw WebGL shaders, Playwright and Axe verification.</li>
              </ul>
              <p className="crate__seal">
                <span className="chip chip--ai">Walkthrough and Q&amp;A on request</span>
              </p>
            </article>
          </div>

          <div className="walk-work">
            <VaultInquiryDesk email={SITE.email} github={SITE.github} city={SITE.city} />
          </div>

          <div className="walk-exit">
            <Doorway to="works" hint="Every public case study, with its evidence." />
          </div>
        </div>
      </Room>
    </>
  );
}

/** The red thread: a plumb line down the wall's left edge that draws itself as the room scrolls by. */
function Thread() {
  return (
    <svg className="thread" viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <line x1="6" y1="0" x2="6" y2="100" />
    </svg>
  );
}

/** One claim knotted to the thread, with a red hairline out to its evidence. */
function Claim({ children, href, proof, external = false }: { children: ReactNode; href: string; proof: string; external?: boolean }) {
  const ext = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <li className="claim">
      <span className="claim__text">{children}</span>
      <span className="claim__line" aria-hidden="true" />
      <a className="claim__proof" href={href} {...ext}>
        {proof}
        {external ? <IconExternal /> : <IconArrow />}
      </a>
    </li>
  );
}
