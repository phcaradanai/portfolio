import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true }, // images are pre-optimised by scripts/optimize-media.ts
  reactStrictMode: true,
};

export default config;
