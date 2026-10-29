import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { ROOMS } from "@/lib/site";

export const dynamic = "force-static";

// shortcut: falls back to the local preview origin until a production domain exists; set NEXT_PUBLIC_SITE_URL when deploying.
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4173";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", ...ROOMS.map((r) => r.href), "/resume/", ...getProjects().filter((p) => p.tier !== "C").map((p) => `/works/${p.slug}/`)];
  return pages.map((p) => ({ url: `${base}${p}` }));
}
