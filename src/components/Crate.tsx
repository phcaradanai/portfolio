import type { Project } from "@/content/schema";
import { Chip } from "./Evidence";
import { period } from "@/lib/view";

/** Private work as a storage tag pinned to the concrete wall: what it is, when, in which languages. Nothing inside is shown. */
export function Crate({ p }: { p: Project }) {
  return (
    <article className="crate" aria-labelledby={`crate-${p.slug}`}>
      <h3 className="crate__title" id={`crate-${p.slug}`}>{p.title}</h3>
      <p className="crate__meta">{period(p)} · {p.stack.join(", ")}</p>
      <ul className="crate__facts">
        {p.claims.map((c) => <li key={c.text}>{c.text}</li>)}
      </ul>
      <p className="crate__seal"><Chip level="private">Not on view</Chip> {p.demo.note}</p>
      <p className="label__acc label__acc--foot">{p.accession}</p>
    </article>
  );
}
