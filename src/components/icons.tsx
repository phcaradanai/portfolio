import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5,
  strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false,
};

/** Evidence level glyphs: shape carries meaning alongside the word. */
export const IconSource = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5.5 2.5h-2v11h2M10.5 2.5h2v11h-2" /><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" /></svg>
);
export const IconReported = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M2.5 3h11v7.5H7l-3 2.5v-2.5H2.5z" /></svg>
);
export const IconRan = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4.5 3l8 5-8 5z" /></svg>
);
export const IconPrivate = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="2.5" y="5.5" width="11" height="8" rx="0.5" /><path d="M2.5 8.5h11M6 5.5V3.5h4v2" /></svg>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={1.75} {...p}><path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" /></svg>
);
export const IconDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={1.75} {...p}><path d="M8 2.5v11M3.5 9L8 13.5 12.5 9" /></svg>
);
export const IconExternal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6.5 3.5h-3v9h9v-3M9 2.5h4.5V7M13.5 2.5L7.5 8.5" /></svg>
);
