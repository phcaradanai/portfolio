import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Room } from "@/components/Room";
import { Frame } from "@/components/Frame";
import { DepthPainting } from "@/components/DepthPainting";
import { WallLabel } from "@/components/WallLabel";
import { Doorway } from "@/components/Doorway";
import { GalleryBrowser, type GalleryItem } from "@/components/GalleryBrowser";
import { getProject, getProjects } from "@/lib/content";
import { media } from "@/lib/media";
import { CATEGORY } from "@/lib/view";
import type { AssetCategory } from "@/content/schema";

export const metadata: Metadata = {
  title: "Art gallery",
  description: "Screenshots, project assets and AI-generated imagery from the work, each labelled with what it is and how it was made.",
};

const ORDER: AssetCategory[] = ["screenshot", "project-asset", "ai-generated", "concept", "diagram"];

export default function Gallery() {
  const manifest: Record<string, { variants: { w: number; file: string }[] }> = JSON.parse(readFileSync(path.join(process.cwd(), "content/media.json"), "utf8"));
  const items: GalleryItem[] = [];
  for (const p of getProjects().filter((x) => x.tier !== "C")) {
    for (const a of p.assets) {
      const m = media(p.slug, a.id);
      if (!m || /-depth$/.test(a.id)) continue;
      const variants = manifest[`${p.slug}/${a.id}`]!.variants;
      items.push({
        key: `${p.slug}/${a.id}`, slug: p.slug, project: p.title, title: a.title, alt: a.alt, category: a.category,
        categoryLabel: CATEGORY[a.category], tools: a.tools, provenance: a.provenance,
        src: m.src, srcSet: m.srcSet, large: variants[variants.length - 1]!.file, width: m.width, height: m.height,
      });
    }
  }
  items.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const categories = ORDER.filter((c) => items.some((i) => i.category === c)).map((id) => ({ id, label: CATEGORY[id] }));

  const rt = getProject("relic-tide");
  const color = rt && media("relic-tide", "atlantis-colour");
  const depth = rt && media("relic-tide", "atlantis-depth");
  const colorAsset = rt?.assets.find((a) => a.id === "atlantis-colour");
  const depthAsset = rt?.assets.find((a) => a.id === "atlantis-depth");

  return (
    <Room id="gallery" label="Art gallery">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 8" }}>
          <h1 className="vinyl vinyl--xl">Art gallery</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
            Pictures from the work. Each one says what it is: a screenshot of running software, an asset that ships inside a project,
            or an image made by a generator, with the tool its repository records. Nothing here is presented as hand-painted unless it was.
          </p>
        </div>

        {color && depth && colorAsset && depthAsset && (
          <div className="gallery__feature">
            <Frame src={color.src} width={color.width} height={color.height} alt={colorAsset.alt}>
              <DepthPainting image={color.src} depth={depth.src} srcSet={color.srcSet} sizes="(max-width: 52rem) 92vw, 60vw" width={color.width} height={color.height} alt={colorAsset.alt} />
            </Frame>
            <WallLabel
              accession={rt!.accession} title="Atlantis city, with its depth map" year="2026" level={2}
              fields={[
                { k: "Colour", v: `${CATEGORY[colorAsset.category]} (${colorAsset.tools.join(", ")})` },
                { k: "Depth", v: `${depthAsset.tools.join(", ") || "Depth-Anything-V2"}, run locally` },
                { k: "Here", v: "Re-rendered in WebGL so nearer parts move more as you move the pointer. Still image when motion is reduced." },
              ]}
            >
              <p>{colorAsset.provenance}</p>
            </WallLabel>
            <figure className="frame gallery__depth">
              <span className="frame__mat">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img src={depth.src} srcSet={depth.srcSet} sizes="(max-width: 52rem) 92vw, 22vw" width={depth.width} height={depth.height} alt={depthAsset.alt} loading="lazy" />
              </span>
              <figcaption className="hang__cap"><strong>The depth map</strong><span>{CATEGORY[depthAsset.category]}</span></figcaption>
            </figure>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <GalleryBrowser items={items} categories={categories} />
        </div>
        <div style={{ gridColumn: "1 / span 6" }}><Doorway to="journey" hint="How the work got here, year by year." /></div>
      </div>
    </Room>
  );
}
