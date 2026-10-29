import type { Project } from "@/content/schema";
import { Chip } from "./Evidence";
import { InlineMd } from "./InlineMd";
import { githubUrl, sha7 } from "@/lib/view";

export function ClaimList({ project }: { project: Project }) {
  return (
    <ol className="claims">
      {project.claims.map((c, i) => (
        <li key={i}>
          <p>{c.text}</p>
          <span className="claims__ev">
            {c.evidence.map((id) => {
              const e = project.evidence.find((x) => x.id === id)!;
              return <Chip key={id} level={e.level} href={`#e-${id}`}>{id}</Chip>;
            })}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Every piece of evidence behind the claims; claim chips link here, so the evidence is one click away and linkable. */
export function Ledger({ project }: { project: Project }) {
  return (
    <ol className="ledger">
      {project.evidence.map((e) => {
        const url = githubUrl(e);
        return (
          <li key={e.id} id={`e-${e.id}`}>
            <header>
              <span className="ledger__id">{e.id}</span>
              <Chip level={e.level} />
              {e.path && <code>{e.path}{e.lines ? `:${e.lines[0]}–${e.lines[1]}` : ""}</code>}
              {e.sha && <span className="ledger__sha">@{sha7(e.sha)}</span>}
              {url && <a href={url} rel="noreferrer">View</a>}
              {e.captureId && <a href={`#c-${e.captureId}`}>Captured run</a>}
            </header>
            {e.quote && <blockquote><InlineMd text={e.quote} /></blockquote>}
            {e.note && <p><InlineMd text={e.note} /></p>}
          </li>
        );
      })}
    </ol>
  );
}
