"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AssetCategory } from "@/content/schema";

export type GalleryItem = {
  key: string; slug: string; project: string; title: string; alt: string;
  category: AssetCategory; categoryLabel: string; tools: string[]; provenance: string;
  src: string; srcSet: string; large: string; width: number; height: number;
};

/** Filterable wall of pictures with a keyboard-friendly viewer built on the native <dialog>. */
export function GalleryBrowser({ items, categories }: { items: GalleryItem[]; categories: { id: AssetCategory; label: string }[] }) {
  const [filter, setFilter] = useState<AssetCategory | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = useMemo(() => items.filter((i) => filter === "all" || i.category === filter), [items, filter]);

  const show = useCallback((i: number, from?: HTMLButtonElement) => {
    if (from) opener.current = from;
    setOpen(i);
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + visible.length) % visible.length));
  const current = open === null ? null : visible[open];

  return (
    <>
      <div className="filters" role="group" aria-label="Filter pictures by kind">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All <span>{items.length}</span></button>
        {categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.label} <span>{items.filter((i) => i.category === c.id).length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{visible.length} pictures shown</p>

      <ul className="hang">
        {visible.map((it, i) => (
          <li key={it.key}>
            <button type="button" className="hang__item" onClick={(e) => show(i, e.currentTarget)} aria-label={`View ${it.title}, ${it.categoryLabel}, from ${it.project}`}>
              <span className="frame__mat">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img src={it.src} srcSet={it.srcSet} sizes="(max-width: 40rem) 92vw, (max-width: 72rem) 45vw, 30vw" width={it.width} height={it.height} alt={it.alt} loading="lazy" decoding="async" />
              </span>
            </button>
            <p className="hang__cap"><strong>{it.title}</strong><span>{it.categoryLabel}{it.tools.length ? ` · ${it.tools.join(", ")}` : ""}</span><span>{it.project}</span></p>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className="viewer" aria-label={current ? current.title : "Picture viewer"}
        onClose={() => { setOpen(null); opener.current?.focus(); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); }}>
        {current && (
          <div className="viewer__in">
            <figure className="viewer__pic">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
              <img src={current.large} width={current.width} height={current.height} alt={current.alt} />
            </figure>
            <div className="label viewer__label">
              <h2 className="label__title">{current.title}</h2>
              <dl className="label__fields">
                <div><dt>From</dt><dd><a href={`/works/${current.slug}/`}>{current.project}</a></dd></div>
                <div><dt>Kind</dt><dd>{current.categoryLabel}</dd></div>
                {current.tools.length > 0 && <div><dt>Tools</dt><dd>{current.tools.join(", ")}</dd></div>}
              </dl>
              <p className="label__text">{current.provenance}</p>
              <div className="viewer__nav">
                <button type="button" className="btn btn--small" onClick={() => step(-1)}>Previous</button>
                <span>{(open ?? 0) + 1} / {visible.length}</span>
                <button type="button" className="btn btn--small" onClick={() => step(1)}>Next</button>
              </div>
              <form method="dialog"><button className="btn btn--small" type="submit" autoFocus>Close</button></form>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
