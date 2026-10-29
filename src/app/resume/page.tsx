import type { Metadata } from "next";
import Link from "next/link";
import { getProfile, getProjects } from "@/lib/content";
import { KIND, MATURITY, period } from "@/lib/view";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description: "Printable resume of Phatcharadanai Kanyapan: education, skills and selected public work with links to the evidence.",
};

/** The conventional resume, built from the same verified data as the exhibition. Prints to one or two A4 pages. */
export default function Resume() {
  const profile = getProfile();
  const work = getProjects().filter((p) => p.tier !== "C");
  const edu = profile.education[0]!;
  return (
    <div className="resume">
      <header className="resume__head">
        <h1>{profile.name}</h1>
        <p>{profile.role} · {profile.city}</p>
        <p>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · <a href={SITE.github}>github.com/phcaradanai</a>{process.env.NEXT_PUBLIC_SITE_URL && <> · <a href={process.env.NEXT_PUBLIC_SITE_URL}>{process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}</a></>}
        </p>
        <p className="resume__actions"><a className="btn" href="/resume.pdf" download>Download PDF</a> <Link className="btn btn--ghost" href="/">Back to the exhibition</Link></p>
      </header>

      <section aria-labelledby="r-summary">
        <h2 id="r-summary">Summary</h2>
        <p>
          Programmer and developer in Bangkok. Builds business systems (a print gateway with a Go runner and desktop shell, an AI agent control plane,
          a local-first desktop tool) and online multiplayer games. Works with AI coding agents, directing and checking their output. Every project
          below links to its repository and to a case study that shows the evidence for each claim.
        </p>
      </section>

      <section aria-labelledby="r-skills">
        <h2 id="r-skills">Skills (as listed on the published CV)</h2>
        <dl className="resume__skills">
          {profile.skills.map((g) => <div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(", ")}</dd></div>)}
        </dl>
      </section>

      <section aria-labelledby="r-work">
        <h2 id="r-work">Selected public work</h2>
        <ol className="resume__work">
          {work.map((p) => (
            <li key={p.slug}>
              <h3>{p.title} <span>{period(p)}</span></h3>
              <p className="resume__meta">{KIND[p.kind]}, {MATURITY[p.maturity].toLowerCase()} · {p.stack.slice(0, 6).join(", ")}</p>
              <p>{p.tagline}</p>
              <p className="resume__links">
                {p.repo && <a href={p.repo.url}>{p.repo.url.replace("https://", "")}</a>}
                {p.repo && " · "}<Link href={`/works/${p.slug}/`}>Case study</Link>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="r-earlier">
        <h2 id="r-earlier">Earlier projects named on the CV</h2>
        <p>{profile.cvProjectLabels.join(", ")}. Listed as published; no further details are given here.</p>
      </section>

      <section aria-labelledby="r-edu">
        <h2 id="r-edu">Education</h2>
        <p>{edu.degree}, {edu.school}, {edu.start}–{edu.end}</p>
      </section>

      <p className="resume__note">Generated from the portfolio&apos;s verified content; facts last checked {profile.lastVerified}.</p>
    </div>
  );
}
