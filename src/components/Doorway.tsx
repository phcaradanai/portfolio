import Link from "next/link";
import { IconArrow } from "./icons";

export type Door = "works" | "agents" | "lab" | "gallery" | "journey" | "studio";
const names: Record<Door, string> = {
  works: "Project worlds",
  agents: "Agent command",
  lab: "Engineering lab",
  gallery: "Art gallery",
  journey: "The journey",
  studio: "The studio",
};
const hrefs: Record<Door, string> = {
  works: "/works/",
  agents: "/agents/",
  lab: "/lab/",
  gallery: "/gallery/",
  journey: "/journey/",
  studio: "/studio/",
};

/** Opening to the next room: shows its wall colour; a normal link. */
export function Doorway({ to, hint }: { to: Door; hint?: string }) {
  return (
    <Link className="doorway" data-to={to} href={hrefs[to]}>
      <span className="doorway__sign">
        <span className="vinyl vinyl--m">Next: {names[to]}</span>
        <IconArrow width={22} height={22} aria-hidden="true" />
      </span>
      {hint && <span className="wall-text wall-text--soft">{hint}</span>}
    </Link>
  );
}
