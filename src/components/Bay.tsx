import Link from "next/link";
import type { Project } from "@/content/schema";
import { Frame } from "./Frame";
import { WallLabel } from "./WallLabel";
import { WorkPiece } from "./WorkPiece";
import { Chip } from "./Evidence";
import { media } from "@/lib/media";
import { KIND, MATURITY, heroAsset, madeBy, period } from "@/lib/view";

/** One tier A work as it hangs in the main gallery: the piece, its label, and for games a strip of further screenshots. */
export function Bay({ p, side, priority }: { p: Project; side: "left" | "right"; priority?: boolean }) {
  const href = `/works/${p.slug}/`;
  const hero = heroAsset(p);
  const extra = p.kind === "game"
    ? p.assets.filter((a) => a.id !== hero?.id && a.category === "screenshot").slice(0, 3).map((a) => ({ a, m: media(p.slug, a.id) })).filter((x) => x.m)
    : [];
  return (
    <article className="onwall bay" data-side={side} data-tier="A" aria-labelledby={`bay-${p.slug}`}>
      <WorkPiece p={p} href={href} priority={priority} />
      <WallLabel
        id={`bay-${p.slug}`} level={2}
        accession={p.accession} title={<Link href={href}>{p.title}</Link>} year={p.period.start.slice(0, 4)}
        fields={[
          { k: "Medium", v: p.stack.slice(0, 6).join(", ") },
          { k: "Kind", v: `${KIND[p.kind]}, ${MATURITY[p.maturity].toLowerCase()}` },
          { k: "Made", v: period(p) },
          { k: "Made by", v: madeBy(p) },
        ]}
        chips={<Chip level="source" href={href}>{p.claims.length} claims, {p.evidence.length} pieces of evidence</Chip>}
      >
        <p>{p.tagline}</p>
      </WallLabel>
      {extra.length > 0 && (
        <ul className="bay__strip" aria-label={`More from ${p.title}`}>
          {extra.map(({ a, m }) => (
            <li key={a.id}>
              <Frame src={m!.src} srcSet={m!.srcSet} sizes="(max-width: 52rem) 45vw, 18vw" width={m!.width} height={m!.height} alt={a.alt} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
