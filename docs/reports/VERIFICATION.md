# Verification report

Build under test: the static export in `out/`, produced by `npm run build` on 2026-10-25, served by `npm start` (`serve out`) on `http://localhost:4173`.

Machine and conditions: Apple M1 (8 cores), macOS, an x64 Node 26.12 under Rosetta for builds and tests, native arm64 Node 26.5 for Lighthouse. The machine was heavily loaded throughout (load averages 3.5–275 during the work; another tool's hook spawned helper processes on every tool call, which were killed before each heavy run with the owner's approval). Timing numbers are therefore conservative and noted with their load.

## Results

| Check | Command | Result |
| --- | --- | --- |
| Content schema, integrity and git proof | `npm run content:verify` | 21 projects, 28 captures, 0 errors, 0 warnings. Every `source`/`reported` evidence path, line range and verbatim quote, and every code excerpt, matched its pinned commit in a local clone |
| Secrets and privacy scan | `npm run content:scan` (content and `out/`) | 0 findings after two scanner false positives were fixed with tests (minified `password=r.password` code; JSON-escaped `<` before an AI co-author email). No IPs, tokens, home paths, other people's emails, or the owner's phone number ship |
| Type check | `npm run typecheck` | clean |
| Lint | `npm run lint` (eslint-config-next 16) | clean (after replacing `setState`-in-effect in `Tabs` with `useSyncExternalStore`) |
| Unit tests | `npm test` | 20 passed (content integrity, diagram layout and label wrapping, secrets scanner, inline Markdown in quotes) |
| End-to-end and accessibility | `npm run e2e` (Playwright 1.64 + axe-core 4.14, system Chrome, desktop 1440×900 and mobile 390×844 with touch, reduced motion) | see below |
| Impeccable detector | `impeccable detect --json src` | `[]` |
| Impeccable finish review | `impeccable-finish-reviewer`, 2 rounds | round 1 `recapture`; round 2 `fix` with 8 material fixes; verdict pass 6 resolved + 2 partial + 1 regression, all three then fixed and confirmed in the built HTML |

### End-to-end suite

What it checks, for every route (7 rooms + 17 case studies) on both viewports: HTTP 200, exactly one `h1`, no console errors, no phone number in page text, no horizontal overflow, and no serious or critical axe violations (WCAG 2.0/2.1/2.2 A and AA tags). Plus: works index tiers and no GitHub links inside private storage tags; no empty frames on sparse pages; excerpt links point at `blob/<40-char sha>/path#Lx-Ly`; evidence deep links land below the sticky rail with the target outline; skip link moves focus to `#main`; lab tabs work with arrow keys and `#slug` deep links; the gallery viewer opens, steps with arrow keys, closes with Escape and returns focus; the gallery filter shows only the chosen kind; the painting stays still under reduced motion; without JavaScript the painting shows its image and every lab panel is readable; the mobile Rooms menu opens from the keyboard.

E2E_RESULT_PLACEHOLDER

## Performance (Lighthouse 13.5.0)

Run 2026-10-25T14:26Z under native arm64 Node. Mobile preset = Lighthouse default (Moto G Power emulation, simulated slow 4G, 4× CPU slowdown); desktop preset = Lighthouse desktop. Raw JSON for each run is in `docs/reports/lighthouse/`.

| Preset | Route | LCP | CLS | TBT | Perf | A11y | Best practices | SEO | Load |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | / | 4.01 s | 0.000 | 35 ms | 87 | 98 | 100 | 100 | 3.7 |
| mobile | /works/ | 3.26 s | 0.000 | 18 ms | 93 | 100 | 100 | 100 | 3.7 |
| mobile | /works/relic-tide/ | 3.02 s | 0.000 | 10 ms | 94 | 99 | 100 | 100 | 3.5 |
| mobile | /lab/ | 3.26 s | 0.000 | 22 ms | 92 | 100 | 100 | 100 | 3.7 |
| mobile | /gallery/ | 3.18 s | 0.000 | 22 ms | 93 | 100 | 100 | 100 | 3.6 |
| desktop | / | 0.64 s | 0.000 | 5 ms | 100 | 98 | 100 | 100 | 3.6 |
| desktop | /works/ | 0.70 s | 0.000 | 0 ms | 100 | 100 | 100 | 100 | 3.8 |
| desktop | /works/relic-tide/ | 0.69 s | 0.000 | 0 ms | 100 | 99 | 100 | 100 | 3.4 |
| desktop | /lab/ | 0.65 s | 0.000 | 0 ms | 100 | 100 | 100 | 100 | 3.9 |
| desktop | /gallery/ | 0.71 s | 0.000 | 0 ms | 100 | 100 | 100 | 100 | 3.8 |

**LCP target (≤ 2.5 s): met on desktop (0.64–0.71 s); not met on the simulated slow-4G mobile profile (3.0–4.0 s).** Mobile LCP also varied between runs: the Foyer measured 3.09 s in the previous run of the same build profile and 4.01 s in this one.

What was done, with measured effect:
- Foyer mobile TBT 5,217 ms → 35 ms: the WebGL painting no longer starts on touch/narrow screens, and its idle drift is one bounded cycle (D11).
- Fonts subset 149 KB → 93 KB (D10); images re-encoded with a 720 px variant at quality 72, Foyer LCP image 190 KB → 89 KB on mobile; first Works bay image made eager with `fetchpriority=high`. Mobile LCP moved from 3.5–4.1 s to 3.0–4.0 s.
- Tried and reverted: not preloading Hanken Grotesk (no LCP gain, introduced 0.007–0.009 CLS).

Remaining causes (from Lighthouse's LCP breakdown): the render-blocking stylesheet (about 160 ms estimated) and the font and hero image sharing a slow simulated link. Next steps if the owner wants the mobile target: inline the critical CSS for the first viewport, serve a 480 px hero on phones, and measure on a real phone over a real network, since the simulated profile is pessimistic for a static site on a CDN.

## Not verified

- Real devices and real networks (only Lighthouse emulation and desktop/mobile Chrome viewports).
- Safari and Firefox (Playwright drove Chrome only).
- Screen readers other than what axe-core and the accessibility tree checks cover.
- A production deployment: none was made, by instruction.
