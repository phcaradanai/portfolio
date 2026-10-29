# Phatcharadanai Kanyapan: a working-studio exhibition

The portfolio of Phatcharadanai Kanyapan (GitHub `phcaradanai`), built as a gallery of working software. Each work hangs with a museum-style wall label (medium, dates from git, who made it, AI involvement), and every claim links to its evidence: a file and line range at a pinned commit, a quote from the repository's own documents, or the recorded output of a real command.

The site still works as a plain resume if you ignore the exhibition: semantic HTML, a printable `/resume/`, and no content behind JavaScript or WebGL.

## Rooms

| Route | Room | What it holds |
| --- | --- | --- |
| `/` | Foyer | Name, positioning, the Atlantis depth painting (raw WebGL), three works on the wall |
| `/works/` | Project worlds | Tier A works as bays, tier B on a shelf, private work as crates "in storage" |
| `/works/<slug>/` | Case study | Problem → Approach → Architecture → Implementation → Outcome → open questions, claims, code, recorded runs, pictures, evidence ledger |
| `/agents/` | Agent command | Interactive 2.5D isometric campus of all 21 repos + CV vault, 6-stage agent harness scrubber, X-ray blueprint, and bilingual inquiry composer |
| `/lab/` | Engineering lab | Read-only workbench of real excerpts, architecture drawings and recorded runs per project |
| `/gallery/` | Art gallery | Every picture labelled as screenshot, project asset or AI-generated, with tools and provenance |
| `/studio/` | The studio | About, skills from the CV, practice table generated from git, AI statement |
| `/journey/` | The journey | Education and repositories created per year (GitHub API) |
| `/resume/` | Resume | Printable resume; `public/resume.pdf` is generated from it |

## Requirements

- Node.js 20.9 or newer (developed on Node 26). On Apple Silicon use a native arm64 Node; an x64 Node under Rosetta works but is several times slower.
- Google Chrome installed (Playwright drives it with `channel: "chrome"`; no browser download needed).
- `gh` (GitHub CLI), authenticated, only for regenerating `content/journey.json`.

## Setup and scripts

```bash
npm install
npm run dev             # http://localhost:3000
npm run build           # content:verify, then a static export into out/
npm start               # serves out/ on http://localhost:4173
```

| Script | Purpose |
| --- | --- |
| `npm run content:verify` | Schema + referential integrity for `content/projects/*.json`; with local clones, checks every path, line range, quote and excerpt against git at the pinned commit (`--strict` fails when a clone is missing) |
| `npm run content:scan` | Fails on IP addresses, tokens, passwords, home paths, other people's emails, or the owner's phone number in content or `out/` |
| `npm run media` | Turns originals in `content/assets-src/<slug>/` into responsive WebP files in `public/media/` and writes `content/media.json` |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Playwright end-to-end and axe accessibility tests against the static export |
| `npx tsx scripts/gen-journey.ts` | Regenerates `content/journey.json` from the GitHub API |
| `npx tsx scripts/gen-practice.ts` | Regenerates `content/practice.json` (which documents exist in each repo at its pinned commit) |

Local clones are found in `$CLONE_ROOT`, `./.clones/` or `/Users/Projects/`. Without them, `content:verify` still validates schema and integrity and warns that git-level checks were skipped.

## Content model

`src/content/schema.ts` defines the contract. A project carries claims, and each claim cites evidence with a level:

| Level | Meaning |
| --- | --- |
| Source | The file exists at the pinned commit (with lines); checked at build |
| Reported | Stated in the repository's own documents, quoted verbatim; not re-run here |
| Ran | A command was executed for this site; its real output is stored in `content/captures/` |
| Private | Redacted work; only non-sensitive metadata |

Tiers: **A** full case study, **B** short entry, **C** private work shown as a crate with metadata only (no repository names, code, screenshots or URLs).

To add or update a project: write `content/projects/<slug>.json` following `docs/research/AGENT_BRIEF.md`, copy images into `content/assets-src/<slug>/`, run `npm run content:verify`, `npm run content:scan`, `npm run media`.

## Design and decisions

- `PRODUCT.md`: product truth, constraints, owner decisions.
- `docs/design/DIRECTIONS.md`: the seven directions considered and why the working-studio exhibition was chosen.
- `docs/design/DECISIONS.md`: stack and architecture decisions with measurements.
- `DESIGN.md`: the visual system as built.
- `docs/SKILL_USAGE.md`: which skills and tools were used, with evidence.
- `docs/reports/VERIFICATION.md`: test, accessibility and performance results with their conditions.

## Privacy and honesty rules

- Contact shown: email, GitHub, city. The phone number on the old CV is never published (`content:scan` enforces it).
- Private repositories appear only as crates with language and commit metadata.
- AI use is stated plainly; AI-generated images are labelled with the tool the repository records.
- Numbers from repository documents keep the "Reported" label unless re-run.

## Deployment

Not deployed. The static `out/` folder can be hosted anywhere (the owner already uses Vercel). Set `NEXT_PUBLIC_SITE_URL` to the production origin before building so the sitemap, robots file and metadata use the right domain. The existing `my_cv` deployment is untouched.
