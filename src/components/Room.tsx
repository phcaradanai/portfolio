import type { ReactNode } from "react";

export type RoomId = "studio" | "works" | "lab" | "gallery" | "journey" | "storage";

/** One room: a coloured wall, a floor, content hung between. */
export function Room({ id, label, children, floor = true, className = "" }: {
  id: RoomId; label: string; children: ReactNode; floor?: boolean; className?: string;
}) {
  return (
    <section className={`room ${className}`} data-room={id} aria-label={label}>
      <div className="room__body">{children}</div>
      {floor && <div className="room__floor" aria-hidden="true" />}
    </section>
  );
}
