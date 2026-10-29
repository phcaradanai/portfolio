type Year = { year: string; public: number; private: number; languages: Record<string, number> };

/** Repositories created per year. Solid = public, hatched = private (counted, never named). One axis, direct labels, a table behind it. */
export function YearBars({ years }: { years: Year[] }) {
  const max = Math.max(...years.map((y) => y.public + y.private), 1);
  const W = 640, H = 260, base = H - 36, top = 28, bw = 48, step = (W - 40) / years.length;
  const y = (n: number) => base - (n / max) * (base - top);
  return (
    <figure className="bars">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="bars-t bars-d">
        <title id="bars-t">Repositories created per year</title>
        <desc id="bars-d">{years.map((e) => `${e.year}: ${e.public} public, ${e.private} private`).join("; ")}</desc>
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="var(--paper)" />
            <rect width="2.5" height="6" fill="var(--ink)" />
          </pattern>
        </defs>
        <line x1="20" x2={W - 20} y1={base} y2={base} className="bars__axis" />
        {years.map((e, i) => {
          const cx = 20 + step * i + step / 2, x = cx - bw / 2;
          const pubH = base - y(e.public), privH = base - y(e.private);
          return (
            <g key={e.year}>
              {e.public > 0 && <path d={`M${x},${base} v${-(pubH - 4)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${pubH - 4} z`} fill="var(--ink)" />}
              {e.private > 0 && <rect x={x} y={y(e.public) - privH - 2} width={bw} height={privH} fill="url(#hatch)" stroke="var(--ink)" strokeWidth="1" />}
              <text x={cx} y={y(e.public + e.private) - (e.private > 0 ? 8 : 8)} textAnchor="middle" className="bars__n">{e.public + e.private}</text>
              <text x={cx} y={base + 20} textAnchor="middle" className="bars__y">{e.year}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="bars__key">
        <span><i className="bars__sw bars__sw--pub" aria-hidden="true" />Public</span>
        <span><i className="bars__sw bars__sw--priv" aria-hidden="true" />Private (counted, not named)</span>
      </figcaption>
      <details className="bars__table">
        <summary>Show as a table</summary>
        <table>
          <caption className="sr-only">Repositories created per year</caption>
          <thead><tr><th scope="col">Year</th><th scope="col">Public</th><th scope="col">Private</th><th scope="col">Main languages</th></tr></thead>
          <tbody>
            {years.map((e) => (
              <tr key={e.year}>
                <th scope="row">{e.year}</th><td>{e.public}</td><td>{e.private}</td>
                <td>{Object.entries(e.languages).filter(([l]) => l !== "Other").sort((a, b) => b[1] - a[1]).slice(0, 4).map(([l, n]) => `${l} ${n}`).join(", ") || "not detected by GitHub"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
