import type { Project } from "@/content/schema";
import { Frame } from "./Frame";
import { Blueprint } from "./Blueprint";
import { XRay } from "./XRay";
import { media } from "@/lib/media";
import { heroAsset } from "@/lib/view";

/**
 * What hangs on the wall for a work. Games lead with their picture; systems lead with structure:
 * the running screen over its architecture when both exist, the architecture drawing alone otherwise.
 * Returns null when the project has nothing visual, so callers can fall back to the label alone.
 */
export function WorkPiece({ p, href, sizes = "(max-width: 52rem) 92vw, 56vw", priority }: { p: Project; href?: string; sizes?: string; priority?: boolean }) {
  const hero = heroAsset(p);
  const m = hero && media(p.slug, hero.id);
  const structural = p.kind !== "game" && !!p.diagram;
  if (p.diagram && m && hero && (hero.category === "screenshot" || hero.category === "diagram")) {
    return (
      <XRay
        surface={/* eslint-disable-next-line @next/next/no-img-element -- static export */
          <img src={m.src} srcSet={m.srcSet} sizes={sizes} width={m.width} height={m.height} alt={hero.alt}
            loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />}
        beneath={<Blueprint diagram={p.diagram!} title={p.title} />}
        surfaceLabel="Running work" beneathLabel="Structure" initial={22}
      />
    );
  }
  if (structural) return <figure className="frame"><span className="frame__mat"><Blueprint diagram={p.diagram!} title={p.title} /></span></figure>;
  if (m && hero) return <Frame href={href} src={m.src} srcSet={m.srcSet} sizes={sizes} width={m.width} height={m.height} alt={hero.alt} priority={priority} transitionName={`work-hero-${p.slug}`} />;
  return null;
}
