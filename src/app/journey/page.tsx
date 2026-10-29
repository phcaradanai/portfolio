import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Room } from "@/components/Room";
import { Doorway } from "@/components/Doorway";
import { YearBars } from "@/components/YearBars";
import { getProfile, tiers } from "@/lib/content";

export const metadata: Metadata = { title: "The journey", description: "Education, and a year-by-year count of repositories on the author's GitHub account." };

type JourneyData = { generatedAt: string; note: string; totals: Record<string, number>; years: Record<string, { public: number; private: number; languages: Record<string, number> }>; firstRepoCreatedAt: string };

export default function Journey() {
  const j: JourneyData = JSON.parse(readFileSync(path.join(process.cwd(), "content/journey.json"), "utf8"));
  const profile = getProfile();
  const years = Object.entries(j.years).map(([year, e]) => ({ year, ...e }));
  const edu = profile.education[0]!;
  const storage = tiers().C.length;
  return (
    <>
      <Room id="journey" label="The journey">
        <div className="wall">
          <div style={{ gridColumn: "1 / span 7" }}>
            <h1 className="vinyl vinyl--xl">The journey</h1>
            <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
              A career is more than repositories, but repositories are what can be checked. This room shows education from the CV and a
              count of repositories created each year. It is not an employment history: the CV lists project names without employers or dates,
              so none are claimed.
            </p>
          </div>

          <ol className="chronology" style={{ gridColumn: "1 / span 6" }}>
            <li><time className="chronology__d">{edu.start}–{edu.end}</time><p><strong>{edu.degree}</strong>, {edu.school}. <span className="chronology__src">Source: published CV.</span></p></li>
            <li><time className="chronology__d">2020-01</time><p><strong>GitHub account created</strong> (20 January 2020). <span className="chronology__src">Source: GitHub API.</span></p></li>
            <li><time className="chronology__d">{j.firstRepoCreatedAt.slice(0, 4)}</time><p><strong>First repository</strong> on the account, created {j.firstRepoCreatedAt.slice(0, 10)}.</p></li>
            <li><time className="chronology__d">Listed on CV</time><p>{profile.cvProjectLabels.join(", ")}. <span className="chronology__src">Names only, as published; no details are claimed.</span></p></li>
            <li><time className="chronology__d">2026</time><p><strong>{j.years["2026"]!.public + j.years["2026"]!.private} repositories created</strong> in 2026, the bulk of the work shown in this exhibition, {storage} of it held back as private work.</p></li>
          </ol>

          <div className="paper" style={{ gridColumn: "7 / span 6" }}>
            <h2 className="paper__h">Repositories created per year</h2>
            <YearBars years={years} />
            <p className="paper__note">
              {j.totals.counted} repositories counted ({j.totals.public} public, {j.totals.private} private). Excluded: {j.totals.forksExcluded} forks and
              {" "}{j.totals.generatedExcluded} generated verification repositories from a project-scaffolding experiment. Queried {j.generatedAt.slice(0, 10)}.
              A count of repositories says nothing about their size or quality.
            </p>
          </div>

          <div style={{ gridColumn: "1 / span 6" }}><Doorway to="studio" hint="How the work gets done, and how to reach me." /></div>
        </div>
      </Room>
    </>
  );
}
