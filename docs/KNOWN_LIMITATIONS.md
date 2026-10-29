# Known limitations and open questions

## Limitations

1. **Mobile LCP** is 3.0–4.0 s on Lighthouse's simulated slow-4G profile, above the 2.5 s target; desktop is 0.64–0.71 s. See `docs/reports/VERIFICATION.md` for causes and next steps.
2. **Case-study layout is the same skeleton for every project type.** The hero differs (picture, or the running screen over its architecture), but games, systems and AI tools share one story layout. The brief asked for different presentations per type; the finish reviewer flagged it as unscored.
3. **Evidence thread is linked, not drawn.** Claims and evidence connect through chips and deep links (`#e-E12`, with a highlighted target), not a line drawn across the page.
4. **Some reported numbers were not re-run.** Test counts, replay counts and scenario counts come from the repositories' own documents and are labelled "Reported". Only read-only commands were executed for captures.
5. **No public demos for the games.** Cursed Market and Relic Tide run on a LAN or locally; their pages say so.
6. **English only.** The data model leaves room for Thai; Thai titles render with the system's Thai font because the self-hosted fonts are Latin subsets.
7. **Resume PDF links.** Case-study links inside `public/resume.pdf` are site-relative until `NEXT_PUBLIC_SITE_URL` is set and the PDF is regenerated (`npm run build && npm start`, then `npm run resume:pdf`).
8. **Screenshots in the repository are limited** to the first viewport of each room in `docs/screenshots/`; full-page review captures stay in the ignored `.impeccable/review/`.
9. **Verification ran on a loaded machine** with an x64 Node under Rosetta; browsers other than Chrome, real devices and screen readers were not tested.
10. **Content freshness.** Everything is pinned to the commits listed on each page (verified 2026-10-24/25). Regenerate with the research brief and `npm run content:verify` when the repositories change.

## Questions for the owner

1. **Private storage entries** (four, metadata only): approve the wording before any public launch, or remove any of them.
2. **Atlantis painting**: the repository marks it as superseded in the game. It is featured on the Foyer and the Gallery with that status stated. Keep it featured?
3. **Relic Tide art sheets**: three sheets carry OpenAI C2PA credentials but their docs name no generator, so they were left out. Confirm the tool if you want them shown.
4. **Vending serial control API**: the repo's own security note about a token once committed and rotated was left out of the page. Include it, or keep it out?
5. **The Patch Press**: the repo is private, so the page uses the live site and three known facts; the period end is the observation date. Supply the real dates if you want them.
6. **Client names from the CV** (PTT, SCG, SIPH, ETRAN, AOT) are listed as plain text only, as decided. Confirm they may appear at all.
7. **Production domain**: set `NEXT_PUBLIC_SITE_URL` before a public build; nothing has been deployed.
