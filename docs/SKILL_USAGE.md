# Skill usage evidence

Maintained during the build. "Evidence" is something observable: a tool result, a file, a command output. A skill name appearing in the brief is not evidence.

Environment: Claude Code harness, skills loaded from `~/.claude/skills`, `~/.agents/skills`, and plugin caches under `~/.claude/plugins/cache/{superpowers,impeccable,caveman,ponytail}`.

## Discovery (2026-10-24)

- Skill installs inspected: `~/.claude/skills` (about 150 entries, mostly game-engine skills), `~/.agents/skills` (same set), plugin caches for superpowers 7.0.0, impeccable 4.6.0, caveman, ponytail.
- Relevant to this build: superpowers (process), impeccable (design lifecycle), caveman and ponytail (communication and scope discipline), `threejs-scene-setup`, `threejs-materials-lighting`, `threejs-gltf-loading`, `shader-programming`, `performance-optimization`, `claude-in-chrome`.
- **Not installed** (gaps; official docs and `npm view` used instead): React Three Fiber / Drei, GSAP, Next.js, TypeScript, accessibility audit, Lighthouse/Core Web Vitals, Playwright/browser testing, GitHub integration, deployment. The 100+ Godot, Unity, Unreal, Roblox, Bevy, Phaser skills are not relevant and were not loaded.
- MCP: `graft` failed to connect (`CONNECTION_CLOSED`). `claude-in-chrome` is configured but the browser extension was "not connected" at test time, so browser verification uses Playwright driving the installed Google Chrome (`channel: "chrome"`). `blender` MCP exists, not used.
- `npm` 11.20 blocks dependency install scripts by default; `esbuild` and `unrs-resolver` postinstalls are not approved. `tsx` and `vitest` were verified to work without them.

## Skill-to-task map

| Phase | Skill | Task | Status |
| --- | --- | --- | --- |
| 0, 1 | superpowers:brainstorming | Design exploration; one decision round with the owner | used |
| 0–2 | impeccable (init, new-work, craft-floor, mode-persuade) | PRODUCT.md, direction roll, direction contract, craft floor | used |
| 1 | impeccable `concept-seed` | Seed `seed:2f096fdb095c9565`; owner chose the "pick" card | used |
| 2+ | impeccable layout / typeset / colorize / adapt / animate references, applied through the finish review | Design refinement loop | used (see log; not every sub-command was run separately) |
| 5 | impeccable detector, finish reviewer (2 rounds + recapture), documenter | Review and finish | used |
| 3 | superpowers:writing-plans | Implementation plan | used |
| 4 | superpowers:test-driven-development | Content integrity, diagram layout, secrets scanner, inline Markdown | used (19 unit tests; failing test first for label wrapping and the emoji case) |
| 4 | superpowers:dispatching-parallel-agents | Parallel content research | used (not loaded as a skill file; agents dispatched with a shared brief) |
| 4 | shader-programming | Depth-parallax painting in raw WebGL; three.js skills not used (see D4) | used (SKILL.md read before writing the shader) |
| 6 | superpowers:verification-before-completion, systematic-debugging | Verification, defects | applied as practice, not loaded as skill files |
| 6 | performance-optimization | LCP / bundle budget | not loaded; Lighthouse insights used directly |
| all | caveman | Terse chat; full prose in files | active (hook) |
| all | ponytail | Smallest complete change; no speculative abstraction | active (hook) |

## Evidence log

| Date | Skill | Invocation / evidence | Artifact | Limitation |
| --- | --- | --- | --- | --- |
| 2026-10-24 | superpowers:brainstorming | `Skill` tool call; its rule "opt-out of questions" applied because the brief says to decide autonomously; one `AskUserQuestion` round held for publication scope | `PRODUCT.md`, `docs/design/DIRECTIONS.md` | The skill's design-document + builder-check step was replaced by the owner's own brief plus `docs/` records |
| 2026-10-24 | impeccable 4.6.0 | Read `SKILL.md`, `reference/{craft,shape,init,new-work,craft-floor,mode-persuade}.md`; ran `scripts/impeccable context`, `concept-seed --scope direction --mode experience` (printed seed `2f096fdb095c9565`); sent choice ping `--kind pick` ("choice recorded") | `PRODUCT.md`, `docs/design/DIRECTIONS.md` | No image-generation tool in this harness, so comp-first mode was unavailable; build is code-led. The design hook is active and reported "No deterministic design-quality issues" on the first two CSS files |
| 2026-10-24 | Agent tool (general-purpose) ×6 | Research briefs in `docs/research/AGENT_BRIEF.md` | `content/projects/*.json` |  Subagent claims are machine-checked by `scripts/verify-content.ts` where a local clone exists |
| 2026-10-24 | dataviz | `Skill` tool call before writing the journey chart; followed: one axis, direct labels, texture plus legend for the private series (not colour alone), table view | `src/components/YearBars.tsx` | Palette validator not run: the chart is single-hue with a hatch, no categorical palette |
| 2026-10-24 | claude-in-chrome | `Skill` tool call; `tabs_context_mcp` returned "Browser extension is not connected" | — | Replaced by Playwright driving system Chrome (`scripts/shoot.ts`) |
| 2026-10-25 | superpowers:writing-plans | `Skill` tool call | `docs/superpowers/plans/2026-10-25-portfolio-exhibition.md` | Written mid-build (content research had started); execution continued without a separate plan approval because the brief asked for autonomous delivery |
| 2026-10-25 | Agent tool (general-purpose, Sonnet) ×4, reruns | Five of the first six research agents hit the account usage limit and their transcripts were lost with the session; four were respawned with "write early, enrich later" and later resumed | 21 verified project files | — |
| 2026-10-25 | impeccable surface brief | `impeccable surface-brief write` and `read`; all six contract blocks and the seed reference present | `.impeccable/surfaces/src-app-page-tsx.md` | — |
| 2026-10-25 | impeccable detector | `impeccable detect --json src` returned `[]` | — | The PostToolUse design hook also scanned every edited UI file and reported no deterministic issues |
| 2026-10-25 | impeccable-finish-reviewer (subagent) | Round 1: `recapture` (pages over 16,384 px repeated in Chromium captures; lab panels all visible because author `display:grid` overrode `hidden`). Round 2: `fix`, 8 material fixes. Verdict pass: 6 resolved, 2 partial plus 1 copy regression, all three then fixed and checked in the built HTML | `.impeccable/review/*.png`, fixes across `src/` | Two review rounds is the Impeccable budget; the final small fixes were verified by DOM checks, not a third review |
| 2026-10-25 | impeccable-documenter (subagent) | Wrote the design system from shipped CSS | `DESIGN.md`, `.impeccable/design.json` | Recorded drift: mono used for counts, dates and chart values (data, permitted by the craft floor) |
