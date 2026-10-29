import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Room } from "@/components/Room";
import { Frame } from "@/components/Frame";
import { WallLabel } from "@/components/WallLabel";
import { Blueprint } from "@/components/Blueprint";
import { WorkPiece } from "@/components/WorkPiece";
import { CodeBlock } from "@/components/CodeBlock";
import { CaptureBlock } from "@/components/CaptureBlock";
import { ClaimList, Ledger } from "@/components/Ledger";
import { Chip, LEVELS } from "@/components/Evidence";
import { IconArrow, IconExternal } from "@/components/icons";
import { getCapture, getProject, getProjects } from "@/lib/content";
import { media } from "@/lib/media";
import { CATEGORY, KIND, MATURITY, heroAsset, madeBy, period, sha7 } from "@/lib/view";
import type { EvidenceLevel, Project } from "@/content/schema";

export const dynamicParams = false;
type Params = { params: Promise<{ slug: string }> };

const shown = () => getProjects().filter((p) => p.tier !== "C");
export const generateStaticParams = () => shown().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.tagline } : {};
}

const paras = (t: string) => t.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

function Section({ id, title, text, children }: { id: string; title: string; text?: string; children?: React.ReactNode }) {
  if (!text && !children) return null;
  return (
    <section className="story__part" aria-labelledby={`s-${id}`}>
      <h2 id={`s-${id}`}>{title}</h2>
      {text && paras(text).map((t, i) => <p key={i}>{t}</p>)}
      {children}
    </section>
  );
}

export default async function CaseStudy({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p || p.tier === "C") notFound();
  const list = shown();
  const next = list[(list.findIndex((x) => x.slug === p.slug) + 1) % list.length]!;
  const hero = heroAsset(p);
  const hm = hero && media(p.slug, hero.id);
  const captures = p.captures.map(getCapture).filter((c) => !!c);
  const repoName = p.repo?.url.replace("https://github.com/", "") ?? "";
  const counts = (Object.keys(LEVELS) as EvidenceLevel[]).map((l) => [l, p.evidence.filter((e) => e.level === l).length] as const).filter(([, n]) => n > 0);
  const gallery = p.assets.filter((a) => a.id !== hero?.id && !/-depth$/.test(a.id)).map((a) => ({ a, m: media(p.slug, a.id) })).filter((x) => x.m);
  const longTitle = p.title.length > 18;

  // A picture leads only when one exists; the architecture drawing has its own place in the story below.
  const heroWork = hm && hero ? <WorkPiece p={p} priority sizes="(max-width: 52rem) 92vw, 80vw" /> : null;

  return (
    <>
      <Room id="works" label={p.title}>
        <div className="wall">
          <div className="case__intro">
            <h1 className={`vinyl ${longTitle ? "vinyl--l" : "vinyl--xl"}`}>{p.title}</h1>
            <p className="wall-text">{p.tagline}</p>
            <p className="wall-text wall-text--soft">{p.summary}</p>
            <div className="btn-row">
              {p.repo && <a className="btn" href={p.repo.url} rel="noreferrer">Source on GitHub <IconExternal /></a>}
              {p.demo.url && <a className="btn btn--ghost" href={p.demo.url} rel="noreferrer">Visit the live site <IconExternal /></a>}
              {p.excerpts.length > 0 && <Link className="btn btn--ghost" href={`/lab/#${p.slug}`}>Open in the lab <IconArrow /></Link>}
              <Link className="textlink" href="/works/">All works</Link>
            </div>
          </div>
          <div className="case__label">
            <WallLabel
              accession={p.accession} title={p.title} year={p.period.start.slice(0, 4)} label="Wall label"
              fields={[
                { k: "Medium", v: p.stack.join(", ") },
                { k: "Kind", v: `${KIND[p.kind]}, ${MATURITY[p.maturity].toLowerCase()}` },
                { k: "Made", v: period(p) },
                { k: "Made by", v: madeBy(p) },
                { k: "Contribution", v: p.contribution },
                ...(p.repo ? [{ k: "Pinned at", v: <a href={`${p.repo.url}/tree/${p.repo.pinnedSha}`}>{sha7(p.repo.pinnedSha)}</a> }] : []),
                { k: "Demo", v: p.demo.note },
              ]}
              chips={counts.map(([l, n]) => <Chip key={l} level={l} href="#ledger">{n} {LEVELS[l].label.toLowerCase()}</Chip>)}
            />
          </div>
          {heroWork && (
            <div className="case__hero">
              {heroWork}
              {hero && <p className="case__caption"><span className="chip chip--cat">{CATEGORY[hero.category]}</span> {hero.title}{hero.tools.length ? `. Made with ${hero.tools.join(", ")}.` : "."}</p>}
            </div>
          )}
        </div>
      </Room>

      <Room id="works" label="The story and its evidence" className="room--reading">
        <div className="wall case__body">
          <article className="paper story" aria-label="Case study">
            {p.narrative ? (
              <>
                <Section id="problem" title="Problem" text={p.narrative.problem} />
                <Section id="approach" title="Approach" text={p.narrative.approach} />
                <Section id="architecture" title="Architecture" text={p.narrative.architecture}>
                  {p.diagram && <figure className="story__figure"><Blueprint diagram={p.diagram} title={p.title} /><figcaption>Modules drawn from the repository at {sha7(p.repo?.pinnedSha)}.</figcaption></figure>}
                </Section>
                <Section id="implementation" title="Implementation" text={p.narrative.implementation}>
                  {p.excerpts.map((x) => <CodeBlock key={x.id} x={x} repo={repoName} />)}
                </Section>
                <Section id="outcome" title="Outcome" text={p.narrative.outcome} />
                <Section id="lessons" title="What the records say is still open" text={p.narrative.lessons} />
              </>
            ) : (
              <>
                <Section id="about" title="About this work" text={p.summary} />
                {p.diagram && <Section id="architecture" title="Architecture"><figure className="story__figure"><Blueprint diagram={p.diagram} title={p.title} /></figure></Section>}
                {p.excerpts.length > 0 && <Section id="code" title="Code">{p.excerpts.map((x) => <CodeBlock key={x.id} x={x} repo={repoName} />)}</Section>}
              </>
            )}
            <Section id="claims" title="Claims, each with its evidence"><ClaimList project={p} /></Section>
          </article>

          <aside className="case__aside" aria-label="Caveats and AI role">
            <div className="label">
              <h2 className="label__title">Limitations</h2>
              <p className="label__sub">From the repository&apos;s own records</p>
              <ul className="caveats">{p.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
            <div className="label">
              <h2 className="label__title">AI role</h2>
              <p>{p.aiRole.summary}</p>
              {p.aiRole.tools.length > 0 && (
                <ul className="caveats">{p.aiRole.tools.map((t) => <li key={t.name}><strong>{t.name}</strong>: {t.use} <a className="chip chip--source" href={`#e-${t.evidence}`}>{t.evidence}</a></li>)}</ul>
              )}
            </div>
          </aside>
        </div>
      </Room>

      {(captures.length > 0 || gallery.length > 0) && (
        <Room id="works" label="Recordings and pictures">
          <div className="wall">
            {captures.length > 0 && (
              <section className="case__runs" aria-labelledby="runs">
                <h2 id="runs" className="vinyl vinyl--m">Captured runs</h2>
                {captures.map((c) => <CaptureBlock key={c!.id} c={c!} />)}
              </section>
            )}
            {gallery.length > 0 && (
              <section className="case__pictures" aria-labelledby="pictures">
                <h2 id="pictures" className="vinyl vinyl--m">Pictures from the work</h2>
                <ul className="pictures">
                  {gallery.map(({ a, m }) => (
                    <li key={a.id}>
                      <Frame src={m!.src} srcSet={m!.srcSet} sizes="(max-width: 52rem) 92vw, 30vw" width={m!.width} height={m!.height} alt={a.alt} />
                      <p className="pictures__cap"><strong>{a.title}</strong> <span className="chip chip--cat">{CATEGORY[a.category]}</span>{a.tools.length > 0 && <> {a.tools.join(", ")}</>}</p>
                    </li>
                  ))}
                </ul>
                <p className="wall-text wall-text--soft"><Link href="/gallery/">See every picture with its provenance in the gallery</Link></p>
              </section>
            )}
          </div>
        </Room>
      )}

      <Room id="storage" label="Evidence ledger">
        <div className="wall">
          <section style={{ gridColumn: "1 / -1" }} aria-labelledby="ledger">
            <h2 id="ledger" className="vinyl vinyl--l">Evidence ledger</h2>
            <p className="wall-text wall-text--soft" style={{ margin: "var(--s-4) 0 var(--s-6)" }}>
              Every claim above links here. Source and reported items point at a file in git at a pinned commit; the build checks that each still matches.
            </p>
            <Ledger project={p} />
          </section>
          <NextWork p={next} />
        </div>
      </Room>
    </>
  );
}

function NextWork({ p }: { p: Project }) {
  return (
    <Link className="nextwork" href={`/works/${p.slug}/`}>
      <span className="vinyl vinyl--m">Next: {p.title}</span>
      <span className="label__acc">{p.accession}</span>
      <span className="wall-text wall-text--soft">{p.tagline}</span>
      <IconArrow width={22} height={22} aria-hidden="true" />
    </Link>
  );
}
