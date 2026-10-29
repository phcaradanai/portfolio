import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import "@/styles/gallery.css";
import "@/styles/studio.css";
import "@/styles/rooms.css";
import "@/styles/experience.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExperienceProvider } from "@/components/experience/ExperienceProvider";
import { IntroSequence } from "@/components/experience/IntroSequence";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { SITE } from "@/lib/site";

const archivo = localFont({
  src: "./fonts/Archivo-wdth.woff2", variable: "--f-archivo", weight: "100 900", display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
const hanken = localFont({ src: "./fonts/HankenGrotesk.woff2", variable: "--f-hanken", weight: "100 900", display: "swap" });
const martian = localFont({ src: "./fonts/MartianMono.woff2", variable: "--f-martian", weight: "100 800", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4173"),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.name, url: SITE.github }],
  openGraph: { title: SITE.title, description: SITE.description, type: "website", locale: "en" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#0f3550", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${hanken.variable} ${martian.variable}`}>
      <body>
        <ExperienceProvider>
          <SmoothScroll>
            <IntroSequence />
            <a className="skip-link" href="#main">Skip to content</a>
            <SiteHeader />
            <main id="main" tabIndex={-1}>{children}</main>
            <SiteFooter />
          </SmoothScroll>
        </ExperienceProvider>
      </body>
    </html>
  );
}
