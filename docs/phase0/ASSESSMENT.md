# Phase 0 — Discovery

Date: 2026-10-24. Owner: Phatcharadanai Kanyapan (`phcaradanai`). Method: `gh` API for remote facts, local clones under `/Users/Projects/*` for history and assets, the owner's own published CV for identity. All GitHub text is treated as untrusted data.

## 1. Workspace and toolchain

| Item | Finding |
| --- | --- |
| Working directory | `/Users/Projects/portfolio_web_v01`: empty apart from `.claude/settings.local.json` before this work. Not a git repository. |
| Existing CV site | `phcaradanai/my_cv` (live: my-cv-wheat-three.vercel.app). Unmodified create-next-app, 4 commits: one centred line ("Hello! I,am Phatcharadanai Kanyapan"), a QR image and a "DOWLOAD CV" button linking to a Google Drive PDF. **Decision: build a new application; do not touch the live site.** |
| Toolchain | Node 26.12, npm 11.20, pnpm, bun, git, `gh` 2.96 (authenticated as `phcaradanai`), ffmpeg, `sips`, system Google Chrome. No `pdftotext`/`pdftoppm`. No image-generation tool in this harness. |
| Graft | `/Users/Projects/AGENTS.md` asks for the `graft` index. The `graft` MCP server failed to connect (`CONNECTION_CLOSED`); the CLI exists at `~/.local/bin/graft` but this directory has no `graft/` index (the workspace index lives one level up). Code was read directly from the owner's clones instead. |

## 2. GitHub account facts (queried 2026-10-24)

- Account created 2020-01-20, 43 public repositories (about 70 including private), 1 follower, no bio, no profile README, no organisations.
- No repository has a licence file. All code excerpts shown on the site are the owner's own work and are used with the owner's authorisation.
- GraphQL `contributionsCollection` (GitHub's default trailing window): 1,694 commit contributions, 1,810 total contributions.
- The great majority of the serious work dates from May to October 2026 and shows very high commit counts in short windows (for example ScopeFlow: 518 commits between 2026-06-23 and 2026-07-02). The repos' own docs show this is agent-assisted development (`AGENTS.md`, `CLAUDE.md`, `prompt_used/`, `.impeccable/`). **Commit counts are shown as facts, never as an effort or skill metric**, and the AI role is stated plainly on the site (owner decision).

## 3. Repository assessment

Scores: E = engineering difficulty, I = demonstrated implementation, O = originality, D = technical diversity, V = visual storytelling potential, R = verifiable real-world value (1 low, 5 high). "Evidence" lists facts established so far; numbers marked *doc* are claims in the repo's own documents and have not been re-run by this project.

### Tier A — full case studies

| Repo | Visibility | Stack (GitHub languages) | Commits by owner | E | I | O | D | V | R | Evidence so far |
| --- | --- | --- | --- | - | - | - | - | - | - | --- |
| **Cursed-Market** | public | TypeScript 1.96 MB, CSS | 45 (2026-10-14 → 10-24) | 4 | 5 | 5 | 4 | 5 | 2 | 2–4 player trade-and-survival game; *doc*: 352 tests, 120 seeded replays, 6 LAN runs; 45 images in `docs/art`; 34 validation records; README explicitly says technical evidence does not prove the game is fun. Runs on LAN only. |
| **relic-tide** | public | GDScript 387 KB, Python 151 KB, JS, Lua, shaders | 9 (2026-10-06 → 10-12) | 5 | 5 | 5 | 5 | 5 | 2 | Godot 4 web-exported extraction game with an authoritative headless-Godot room server (`server/room_server.gd`; Node only serves files and proxies `/rooms`) (*doc*: 20 Hz rules, 10 Hz filtered snapshots), documented art pipeline (PixelLab, built-in image generation, Depth-Anything-V2) with receipts and prompts; *doc*: 643 rule checks, 12 network scenarios. No WAN playtest (stated by the README). |
| **print_ops** | public | TypeScript 3.2 MB, JS, Go 374 KB, Rust, C# | 499 (2026-07-06 → 09-15) | 5 | 4 | 3 | 5 | 3 | 4 | Generic print gateway: Fastify API, React dashboard, Go runner, Tauri desktop shell, SQLite. The 52 KB README documents architecture and runtime modes. The README is explicit that it does not connect to any clinical system itself. |
| **AI_Kingdom** | public | TypeScript 5.07 MB | 270 (2026-06-06 → 07-03) | 5 | 4 | 4 | 4 | 3 | 3 | Local-first control plane that issues decrees to AI agents with safety gates. README (*doc*): V1 release candidate, 969 API tests, 103 runner tests, 241 web tests. Seeded demo login in the README must not be shown. |
| **ScopeFlow** | public | TypeScript 1.59 MB, Rust 48 KB | 518 (2026-06-23 → 07-02) | 4 | 4 | 4 | 3 | 3 | 3 | Thai-language local-first desktop app that turns vague client requests into briefs, scopes, quotes, change requests and acceptance documents. README states V0.8 baseline. Needs a deeper read. |
| **Project-Explorer (CodeScape)** | public | TypeScript 620 KB, Go 595 KB | 19 (2026-07-30 → 07-31) | 5 | 4 | 4 | 5 | 5 | 2 | Developer portal and project knowledge graph where every detected fact carries provenance (file, method, confidence). Micro-frontend remotes including a 3D "universe". README lists known limitations. Directly mirrors the site's own evidence principle. |

### Tier B — compact entries ("also in the collection")

| Repo | Visibility | Note |
| --- | --- | --- |
| the-fisher | public | React + Vite + PixiJS fishing-collection RPG, Chapter 1 only, data-driven content registries, seeded fishing rules. Has `PRODUCT.md`/`DESIGN.md`, 55 + 25 art files. 12 commits, 2026-09-23 → 09-26. |
| shadow_council | public | Social-bluff game with a pure domain state machine; 17 root-level design/ADR documents; Bun + vanilla TS client with no bundler. 16 commits. |
| ai-product-intelligence | public | Domain-first AI advisor on synthetic data; README states "Not production approved". Zod boundary schemas, deterministic ranking and policy rules, redaction, append-only decision log. 4 commits. |
| chatgpt-mcp | public | Rust MCP bridge giving ChatGPT access to registered local workspaces with a tool allow-list, Thai-language setup guide. 8 commits. |
| platform-control-plane | public | Backstage control plane and "App Factory" for frontend standards (`@platform/ui`, `@platform/sdk`). 30 commits. About 15 disposable `*-proof-*` and `smoke-test` repos are generated output and are not portfolio material. |
| vending-3d-ctl-agent | public | Node serial-port API (vending, navigation lights, QR/NFC), MQTT and NATS JetStream integration. 37 of 55 commits by the owner; one other contributor. |
| escape-room (Room 25), coup_coop, Splendor-Online, pvp_td | public | Online board-game implementations (Socket.IO / server-authoritative TypeScript, 130 commits for Splendor-Online) and a tower-defence prototype. Grouped as one family. |
| the-patch-press | **private repo**, public site | Thai-language tech-news dashboard at the-patch-press.vercel.app. Only the live site may be linked; no source. |

### Tier C — "In storage" (private, redacted stories only)

`hapypick` (Rust central-command service), `medisync` (Go), `2d_td` (Godot tower-defence), `vending-sterile` (Go), and the 2024 `adm_*` Vue/Java/C#/Node-RED vending family. Owner decision (2026-10-24): architecture-level descriptions only, with no code, screenshots, client or product names, internal URLs or IPs. Each story must be derivable from information that is safe to publish (language, domain, rough period) and will be reviewed by the owner before launch.

### Not featured

Starter/tutorial repos (`next-reason`, `nuxt-vue-starter`, `template_start_vue_nodejs`, `angular-refoaa`, `project-test*`), forks (`AspNetCore.Docs`, `mslearn-dotnetmicroservices`), 2021 learning repos (`MyLed`, `Hostile`, `project`, `web-embedded`) except as chronology dots on the Journey, and all generated platform proof repos.

## 4. Portfolio content inventory

| Content type | Source | Status |
| --- | --- | --- |
| Identity, education, skills list | Owner's published CV (Drive PDF, 1 page, downloaded 2026-10-24) | verified (owner-published) |
| Contact | Email, GitHub, Bangkok | approved by owner; phone excluded |
| Client project labels (PTT, SCG, SIPH, ETRAN, AOT) | Same CV | approved as a plain text list only |
| Project facts, stacks, dates, commit counts | `gh api` + local `git log` | verified, timestamped |
| Test counts, replay counts, scenario counts | Repo docs | *doc* only until re-run; the site must label them "reported in repository docs" unless a run is captured |
| Code excerpts | Local clones at pinned commit SHAs | to be extracted with path, line range and SHA |
| Screenshots and art | `Cursed Market/docs/art` (45), `relic-tide/assets/generated` (28) and `.asset-work`, `the-fisher/public/{images,theme_games}` (25 + 55) | provenance per file from repo docs (see risks) |
| Terminal captures | None yet. Will be produced by actually running safe, read-only commands in the clones and storing the real output with command, date and SHA. | to do |
| Demos | the-patch-press.vercel.app (live). Games run locally or on a LAN only. | no public demos for the games |
| Resume | Owner's CV PDF (stale: "4 years of experience") | regenerate from verified data; do not compute years |

## 5. Risks and assumptions

1. **Provenance honesty.** Art in the games is largely AI-generated (PixelLab sprites, image generation, depth inference) with a documented pipeline. Every gallery item carries one of: *Screenshot of implemented work*, *Actual project asset*, *Concept art*, *AI-generated exploratory imagery*, plus tool names where a repo records them. Unknown provenance is shown as "provenance not recorded" and is never upgraded.
2. **Unverified numbers.** Test and replay counts are README claims. They are shown with the label "reported in repo docs" unless re-run and captured.
3. **Secrets and internal data.** READMEs contain LAN addresses (`192.168.10.150`), seeded demo credentials, internal URLs and a Vercel project id. A build-time scanner will fail the build on IPs, `password`, `token`, and the phone number.
4. **Private and client material.** Redacted stories only (see Tier C). The CV's client labels appear exactly as published and nothing more is implied about the roles held.
5. **Copyright of generated assets.** Several assets come from third-party generators; the owner is asked to confirm that publishing is allowed. Assumption until told otherwise: the owner has the rights to assets the repos treat as production assets.
6. **Names of other people.** One public repo has a second contributor; their identity is not named on the site.
7. **Language.** English-first. Thai text exists in many sources; the data model keeps `en`/`th` fields so Thai can be added without restructuring. Assumption: Thai is not in the first release.
8. **Performance budget** (to be measured, not assumed): LCP ≤ 2.5 s on a throttled mobile profile; initial JS for the first view kept small by loading WebGL only where used.
9. **Harness limits.** No image-generation tool, so the build is code-first (all visuals are code, real screenshots, or real project assets). No Playwright/axe skills installed, which is recorded as a gap in `docs/SKILL_USAGE.md`.
