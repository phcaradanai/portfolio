import Link from "next/link";
import { LEVELS } from "./Evidence";
import { IconExternal } from "./icons";
import { SITE } from "@/lib/site";
import { getProjects } from "@/lib/content";

const lastVerified = () => getProjects().map((p) => p.lastVerified).sort().at(-1) ?? "";
import type { EvidenceLevel } from "@/content/schema";

export function SiteFooter() {
  return (
    <footer className="lobby" id="contact">
      <div className="lobby__in">
        <section aria-labelledby="visit">
          <h2 id="visit">Get in touch</h2>
          <ul>
            <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li><a href={SITE.github} rel="me">github.com/phcaradanai <IconExternal width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} /></a></li>
            <li>{SITE.city}</li>
            <li><Link href="/resume/">Resume</Link> · <a href="/resume.pdf" download>PDF</a></li>
          </ul>
        </section>
        <section aria-labelledby="read">
          <h2 id="read">How to read the labels</h2>
          <dl className="lobby__legend">
            {(Object.keys(LEVELS) as EvidenceLevel[]).map((k) => {
              const { label, blurb, Icon } = LEVELS[k];
              return <div key={k}><dt><span className={`chip chip--${k}`}><Icon />{label}</span></dt><dd>{blurb}</dd></div>;
            })}
          </dl>
        </section>
        <p className="lobby__fine">
          Built with AI coding agents, directed and checked by the author; each project page says which tools its repository documents.
          Source excerpts come from the author&apos;s public repositories. Content last verified against git on {lastVerified()}.
        </p>
      </div>
    </footer>
  );
}
