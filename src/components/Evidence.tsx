import type { EvidenceLevel } from "@/content/schema";
import { IconPrivate, IconRan, IconReported, IconSource } from "./icons";

export const LEVELS: Record<EvidenceLevel, { label: string; blurb: string; Icon: typeof IconSource }> = {
  source: { label: "Source", blurb: "The file exists in git at a pinned commit; the site checks it at build time.", Icon: IconSource },
  reported: { label: "Reported", blurb: "Stated in the repository's own documents. Not re-run here.", Icon: IconReported },
  ran: { label: "Ran", blurb: "A command was actually executed for this site; the real output is kept.", Icon: IconRan },
  private: { label: "Private", blurb: "Redacted work: only non-sensitive metadata is shown.", Icon: IconPrivate },
};

export function Chip({ level, children, href }: { level: EvidenceLevel; children?: React.ReactNode; href?: string }) {
  const { label, Icon } = LEVELS[level];
  const inner = (<><Icon />{children ?? label}</>);
  return href
    ? <a className={`chip chip--${level}`} href={href}>{inner}</a>
    : <span className={`chip chip--${level}`}>{inner}</span>;
}
