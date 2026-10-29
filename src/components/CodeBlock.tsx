import type { CodeExcerpt } from "@/content/schema";
import { highlight } from "@/lib/highlight";
import { InlineMd } from "./InlineMd";
import { githubUrl, sha7 } from "@/lib/view";

/** A curated excerpt of real code at a pinned commit. Highlighting happens at build time. */
export async function CodeBlock({ x, repo }: { x: CodeExcerpt; repo: string }) {
  const html = await highlight(x.code, x.language);
  const url = githubUrl({ repo, sha: x.sha, path: x.path, lines: [x.startLine, x.endLine] });
  return (
    <figure className="code" id={`x-${x.id}`}>
      <figcaption className="code__head">
        <strong className="code__title">{x.title}</strong>
        <code>{x.path}:{x.startLine}–{x.endLine}</code>
        <code>@{sha7(x.sha)}</code>
        <span className="code__note">Curated excerpt, not a live session</span>
        {url && <a href={url} rel="noreferrer">View at commit</a>}
      </figcaption>
      <div style={{ ["--start" as string]: x.startLine }} dangerouslySetInnerHTML={{ __html: html }} />
      <p className="code__why"><strong>What to notice:</strong> <InlineMd text={x.why} /></p>
    </figure>
  );
}
