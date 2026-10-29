# Working-Studio Exhibition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the portfolio as a static Next.js site where every room (Foyer, Works, case studies, Lab, Gallery, Studio, Journey, Resume) renders verified content with its evidence.

**Architecture:** Validated JSON in `content/` (zod schema `src/content/schema.ts`, git-checked by `scripts/verify-content.ts`) is read at build time by server components; client code is limited to `Tabs`, `XRay`, `DepthPainting`, `SiteHeader` and the gallery viewer. Visual world in `src/styles/{globals,gallery,studio}.css`.

**Tech Stack:** Next.js 16.4.3 (App Router, `output: "export"`), React 19.3, TypeScript 5.9, zod 4, shiki 4 (build-time), raw WebGL, Vitest 5, Playwright 1.64 + axe-core with system Chrome, sharp.

**Spec:** the owner's brief (conversation of 2026-10-24), `PRODUCT.md`, `docs/design/DIRECTIONS.md`, `docs/design/DECISIONS.md`, `docs/phase0/ASSESSMENT.md`.

**Status when written (2026-10-25):** schema, verifier, secrets scanner, media pipeline, layout, header/footer, Foyer, Studio, Journey and the shared components (`Frame`, `WallLabel`, `Room`, `Doorway`, `Chip`, `Tabs`, `Blueprint`, `XRay`, `CodeBlock`, `CaptureBlock`, `ClaimList`, `Ledger`, `DepthPainting`, `YearBars`) exist; 8 of 21 content files are verified; 4 research agents are writing the rest. Unit tests: 13 passing.

## Global Constraints

- Contact on the site: `phcaradanai@gmail.com`, `github.com/phcaradanai`, "Bangkok, Thailand". The phone number must never ship (`npm run content:scan` enforces).
- Private repos: tier C only, metadata only, no repo names, no code, no screenshots, no URLs.
- AI role stated plainly; every AI-generated image labelled with the tool its repo records.
- No invented employers, dates, metrics or credentials; `reported` numbers keep the label "Reported".
- Display type max 6rem; body measure ≤ 75ch; WCAG 2.2 AA; `prefers-reduced-motion` honoured; no kicker/eyebrow above headings; no glass, neon, gradient text, or hard offset shadows.
- No three.js (D4). No new runtime dependencies without a recorded decision.
- Do not deploy or touch `my_cv` production.

## Review Focus

1. **No JavaScript or no WebGL:** every room still shows its content; the Foyer painting shows its static image; Lab panels all visible. Pinned by Task 6's `no-js` test.
2. **Narrow screens and long or Thai titles** ("Cursed Market (ตลาดวัตถุต้องสาป)", "Room 25 Ultimate (ห้องมรณะ 25)"): no horizontal page scroll at 390 px. Pinned by Task 6's `no-overflow` test.
3. **Deep links to evidence** (`/works/<slug>/#e-E5`) from another page: the target is highlighted and not hidden under the sticky rail. Pinned by Task 6's `evidence-target` test.
4. **Sparse projects** (tier B with no assets, diagram or excerpts): no empty frames or empty headings. Pinned by Task 2's `sparse` test.
5. **Reduced motion and keyboard only:** the depth painting never starts with reduced motion; Lab tabs and the gallery viewer work with keys alone; focus returns after the viewer closes. Pinned by Task 6's `keyboard` and `reduced-motion` tests.

---

### Task 1: Content completion

**Files:** `content/projects/*.json` (agents + tier C by hand), `content/media.json`, `public/media/**`.

- [ ] **Step 1:** Agents finish `cursed-market`, `print-ops`, `ai-kingdom`, `scopeflow`, `codescape`, and 8 tier B files.
- [ ] **Step 2:** Run `npm run content:verify` → expect `content:verify ok — 21 projects … 0 errors`.
- [ ] **Step 3:** Run `npm run content:scan` → expect `content:scan ok`.
- [ ] **Step 4:** Run `npm run media` → every asset in `content/media.json` has ≥ 1 variant.
- [ ] **Step 5:** Commit `feat(content): verified project records`.

### Task 2: Works index and case-study pages

**Files:** Create `src/app/works/page.tsx`, `src/app/works/[slug]/page.tsx`, `src/components/Bay.tsx` (tier A composition), `src/components/Crate.tsx` (tier C); extend `src/styles/studio.css`. Test: `tests/e2e/works.spec.ts`.

**Interfaces:**
- Consumes: `getProjects()`, `getProject(slug)`, `tiers()`, `getCapture(id)` from `src/lib/content.ts`; `media(slug, assetId): Media | undefined`; `heroAsset`, `madeBy`, `period`, `MATURITY`, `KIND`, `CATEGORY`, `githubUrl` from `src/lib/view.ts`.
- Produces: routes `/works/` and `/works/<slug>/` for tiers A and B (tier C has no page; its crate on `/works/` carries all of its content). Ledger items have ids `e-<EvidenceId>`; excerpts `x-<excerptId>`; captures `c-<captureId>`.

- [ ] **Step 1: Write failing e2e tests** in `tests/e2e/works.spec.ts`:
  - `index lists every tier`: `/works/` has one `[data-tier="A"]` per tier A project, one `[data-tier="B"]` row per tier B, one `.crate` per tier C, and no `a[href*="github.com"]` inside `.crate`.
  - `sparse`: for every tier B slug, `/works/<slug>/` has no `.frame` without an `img` or `canvas`, and no `h2` followed directly by another `h2`.
  - `excerpt links`: every `.code__head a` href matches `^https://github.com/phcaradanai/[^/]+/blob/[0-9a-f]{40}/.+#L\d+-L\d+$`.
- [ ] **Step 2:** `npm run build && npx playwright test tests/e2e/works.spec.ts` → FAIL (routes missing).
- [ ] **Step 3:** Implement `/works/`: vinyl title; tier A as bays (game: hero frame + label + three small frames; system/ai/tool: `XRay` with hero screenshot over `Blueprint` when both exist, else framed `Blueprint` on paper); tier B as a shelf of label strips; tier C as crates with stencilled title, period, language mix and "Details withheld".
- [ ] **Step 4:** Implement `/works/[slug]/` with `generateStaticParams` over tiers A and B and `dynamicParams = false`: intro (title, tagline, label with medium/period/made by/status, repo and demo links), story sections in order Problem → Approach → Architecture → Implementation → Outcome → Lessons (tier A only), `ClaimList`, excerpts, captures, assets with category labels, limitations, contribution, AI role, `Ledger`, doorway to the next accession.
- [ ] **Step 5:** Re-run the tests → PASS. Commit `feat(works): index and case studies`.

### Task 3: Lab

**Files:** Create `src/app/lab/page.tsx`; reuse `Tabs`, `CodeBlock`, `Blueprint`, `CaptureBlock`. Test: `tests/e2e/lab.spec.ts`.

- [ ] **Step 1: Failing tests:** `tabs keyboard` (focus first tab, ArrowRight selects the second and shows `#panel-<slug2>`, hides the first); `hash deep link` (`/lab/#print-ops` opens that panel); `labelled replay` (every `.capture` contains "not a live terminal").
- [ ] **Step 2:** Implement: one tab per project with excerpts (tier A then B, accession order); each panel shows the blueprint (if any), every excerpt, every capture, and a link to the case study; `<noscript><style>[role=tabpanel][hidden]{display:block}</style></noscript>`.
- [ ] **Step 3:** Tests PASS. Commit `feat(lab): engineering workbench`.

### Task 4: Gallery

**Files:** Create `src/app/gallery/page.tsx`, `src/components/GalleryBrowser.tsx` (client). Test: `tests/e2e/gallery.spec.ts`.

**Interfaces:** `GalleryItem = { key: string; slug: string; project: string; title: string; alt: string; category: Asset["category"]; tools: string[]; provenance: string; src: string; srcSet: string; large: string; width: number; height: number }`.

- [ ] **Step 1: Failing tests:** `filter` (pressing the "AI-generated" filter sets `aria-pressed="true"` and every visible item has category text "AI-generated image"); `viewer` (Enter on an item opens `dialog[open]`, ArrowRight changes the image, Escape closes it and focus returns to the opener).
- [ ] **Step 2:** Implement: depth painting at the top with its label; filter buttons (All + categories present); masonry (CSS columns) of framed items with captions; native `<dialog>` viewer with prev/next buttons, keyboard arrows, full label (project link, category, tools, provenance).
- [ ] **Step 3:** Tests PASS. Commit `feat(gallery): provenance-labelled gallery`.

### Task 5: Resume, 404, metadata

**Files:** Create `src/app/resume/page.tsx`, `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `scripts/resume-pdf.ts`; print rules in `src/styles/print.css`.

- [ ] **Step 1:** Resume page from `profile.json` + tier A/B projects (title, period, stack, tagline, link). No years-of-experience figure. Print CSS: white page, black text, no rail/footer, links printed.
- [ ] **Step 2:** `scripts/resume-pdf.ts` renders `/resume/` from the static export with Playwright `page.pdf({ format: "A4" })` into `public/resume.pdf`; `npm run resume:pdf`.
- [ ] **Step 3:** 404 room with links to every room. `sitemap.ts` lists all static routes; `robots.ts` allows all and points to the sitemap. Every page exports `metadata` with a unique title and description.
- [ ] **Step 4:** Commit `feat: resume, 404, metadata`.

### Task 6: End-to-end, accessibility, performance

**Files:** `tests/e2e/site.spec.ts`, `scripts/lighthouse.ts`, `docs/reports/VERIFICATION.md`.

- [ ] **Step 1: Tests:** `routes` (each route returns 200, has one `h1`, no console errors); `no-overflow` (at 390 px, `scrollWidth <= innerWidth` on every route); `axe` (no serious or critical violations on every route); `no-js` (Foyer with JS disabled shows `img` in `.depth`, Lab shows all panels); `evidence-target` (`/works/relic-tide/#e-E1`: `#e-E1` top ≥ rail height and has the target outline); `keyboard` (skip link moves focus to `#main`; mobile Rooms menu opens with Enter); `reduced-motion` (Foyer canvas `data-live` stays `false`); `no-phone` (page text of every route lacks the phone digits).
- [ ] **Step 2:** `npm run build && npm run e2e` → all PASS on desktop and mobile projects.
- [ ] **Step 3:** `scripts/lighthouse.ts` runs Lighthouse (mobile and desktop presets) on `/`, `/works/`, `/works/relic-tide/`, `/lab/`, `/gallery/` against `npx serve out`; writes JSON to `docs/reports/lighthouse/` and a table (LCP, CLS, TBT, performance, accessibility) with machine, load average and throttling noted.
- [ ] **Step 4:** Commit `test: e2e, a11y and performance evidence`.

### Task 7: Design refinement and documentation

- [ ] **Step 1:** Capture `/`, `/works/`, one case study, `/lab/`, `/gallery/`, `/studio/`, `/journey/` at 1440×900 and 390×844 into `.impeccable/review/`; critique against the direction contract; fix in one batch; recapture once.
- [ ] **Step 2:** Run `impeccable detect --json src` once; fix mechanical findings.
- [ ] **Step 3:** Spawn `impeccable-finish-reviewer` with the screenshots and contract; apply the material fixes; recapture.
- [ ] **Step 4:** Spawn `impeccable-documenter` → `DESIGN.md` + `.impeccable/design.json`.
- [ ] **Step 5:** README (setup, scripts, content workflow, verification), `docs/SKILL_USAGE.md`, `docs/reports/VERIFICATION.md`, known limitations. Commit.
