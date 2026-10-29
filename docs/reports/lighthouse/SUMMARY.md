Lighthouse 13.5.0, 2026-10-25T14:26:57.507Z, 8× Apple M1, darwin, Lighthouse run under native arm64 Node (/opt/homebrew/bin/node).
Target: static export served by `npx serve out` on localhost. Mobile preset = Lighthouse default (Moto G Power emulation, simulated slow 4G, 4× CPU slowdown); desktop preset = Lighthouse desktop. "Load" is the 1-minute load average when each run started.

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
