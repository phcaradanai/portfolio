# Decisions

Each entry: decision, why, what would change it.

## D1. New application, not an extension of `my_cv`
`my_cv` is a four-commit create-next-app starter. Nothing to extend. The live `my-cv-wheat-three.vercel.app` is untouched.

## D2. Next.js 16 App Router, static export, TypeScript
Why: HTML-first content (LCP, SEO, no-JS reading), the owner already deploys Next to Vercel, static output can be hosted anywhere. Client JS is limited to the room menu, the x-ray lens, the evidence thread, the gallery viewer and the one WebGL painting. Change if: a server feature (form handling, live GitHub sync) becomes necessary.

## D3. Plain CSS with tokens in `@layer`, no Tailwind
Why: the visual world is built from a small set of authored objects (wall, frame, label, vinyl). Utility classes would push toward the generic card grid the brief rejects. Tokens live in `src/styles/globals.css`.

## D4. Raw WebGL for the depth painting; no three.js, no React Three Fiber
Measured 2026-10-24 with esbuild (minify, ESM): the smallest useful three.js scene (renderer, scene, orthographic camera, plane, shader material, texture loader) bundles to 518 KB, **132.5 KB gzipped**. The painting is one textured quad and one fragment shader, about 2 KB of raw WebGL. The brief allows three.js "only where it materially improves the experience"; here it would not. Loaded only on pages that use it, after first paint, with a static image as the LCP element and as the no-WebGL fallback. The installed three.js skills (`threejs-scene-setup`, `threejs-materials-lighting`) were not used because three.js was not adopted. Change if: a scene needs models, lighting or more than a few meshes.

## D5. Content as validated JSON with evidence levels
`content/projects/*.json` (zod, `src/content/schema.ts`). Build runs `scripts/verify-content.ts`: schema, referential integrity, and where a clone exists, git-level proof that every path, line range, quote and excerpt matches the pinned commit. Evidence levels: `source`, `reported`, `ran`, `private`. Test counts and similar numbers stay `reported` unless a capture exists.

## D6. Fonts self-hosted through `next/font/local`
Archivo (variable width and weight, vinyl lettering), Hanken Grotesk (labels and text), Martian Mono (identifiers and code only). All SIL OFL; licences in `src/app/fonts/`. Latin subsets only. Thai text is not shipped yet; add Noto Sans Thai when Thai content is approved.

## D7. English first
Content fields are English. The data model leaves room for a `th` variant without restructuring.

## D8. Verification tooling
Playwright (`@playwright/test`) driving the installed Google Chrome (`channel: "chrome"`) so no browser download is needed; `@axe-core/playwright` for accessibility; Lighthouse via `npx lighthouse` against the static export. Machine load during parallel agent work was above 60 on 2026-10-24, so timing numbers taken then are indicative only and will be re-measured on an idle machine and labelled with their conditions.

## D9. Private work
Tier C entries are generated from GitHub metadata only (language, period, commit counts). Their repo names never enter the content. The owner reviews them before any public launch.

## D10. Font subsetting
`scripts/subset-fonts.sh` subsets the three faces with fonttools (installed only in an isolated `.tmp/venv`, never globally; fonttools 4.60.1 and brotli from PyPI). Archivo is only ever set in uppercase, so lowercase glyphs are dropped. Sizes: Archivo 90 → 49 KB, Hanken 35 → 29 KB, Martian Mono 24 → 16 KB. The `@fontsource-variable` packages stay as the subsetting source.

## D11. The depth painting runs only on wide screens with a fine pointer, and only briefly
On phones the painting is the still image: the motion answers a pointer that phones do not have, software WebGL is expensive, and Lighthouse measured 5.2 s of blocking time on the mobile Foyer while it ran. On desktop it drifts through one 10-second cycle after load and then rests until the pointer moves, so nothing animates indefinitely in the background. Reduced motion keeps it still everywhere.

## D12. Measuring on this machine
The development machine runs an x64 Node under Rosetta, and a `trail-code` hook in the owner's global Claude Code settings spawns helper processes on every tool call. The owner approved killing those helpers before heavy runs. Lighthouse refuses to drive Chrome from x64 Node on Apple Silicon, so it runs under the native arm64 Node at `/opt/homebrew/bin/node` (`LH_NODE`). Every reported number states its conditions.

## D13. Adoption of React Three Fiber (R3F) for Awwwards-Grade 3D World (Reversing D4 for 3D Routes)
Adopted Three.js and `@react-three/fiber` specifically for the 3D isometric hero stage and `/agents` world. To preserve performance budgets:
1. R3F is strictly code-split via `next/dynamic` (`ssr: false`) and loaded only on pages hosting the 3D world after first paint.
2. Initial non-3D bundle size is untouched; the static LCP image renders immediately before WebGL initialization.
3. Universal fallback: a pre-rendered high-res static poster (`world-poster.avif`) is served for mobile, low-memory devices, or `prefers-reduced-motion`.

## D14. Lenis Smooth Scroll on Desktop Only
Adopted Lenis for high-precision momentum scrolling and camera waypoint choreography. Constrained to desktop (`pointer: fine` and width >= 768px). Disabled entirely on mobile and under `prefers-reduced-motion`.

## D15. Declarative View Transitions via React 19 `<ViewTransition>`
Adopted native React 19 `<ViewTransition>` for seamless page morphing and route crossfades, avoiding heavyweight runtime animation coordinators while maintaining 60fps hardware-accelerated transitions.
