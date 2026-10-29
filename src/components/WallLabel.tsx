import type { ReactNode } from "react";

type Field = { k: string; v: ReactNode };

/** A museum wall label. Run-in fields, not a form. */
export function WallLabel({ accession, title, year, fields, children, chips, as: As = "aside", label, level = 3, id }: {
  accession?: string; title: ReactNode; year?: string; fields?: Field[]; children?: ReactNode; chips?: ReactNode;
  as?: "aside" | "div" | "article"; label?: string; level?: 2 | 3; id?: string;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <As className="label" aria-label={label} id={id}>
      <H className="label__title">{title}{year && <small>{year}</small>}</H>
      {fields && (
        <dl className="label__fields">
          {fields.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
        </dl>
      )}
      {children && <div className="label__text">{children}</div>}
      {chips && <div className="chips">{chips}</div>}
      {accession && <p className="label__acc label__acc--foot">{accession}</p>}
    </As>
  );
}
