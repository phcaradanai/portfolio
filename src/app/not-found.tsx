import Link from "next/link";
import { Room } from "@/components/Room";
import { Doorway } from "@/components/Doorway";
import { WallLabel } from "@/components/WallLabel";
import { ROOMS } from "@/lib/site";

export default function NotFound() {
  return (
    <Room id="storage" label="Not found">
      <div className="wall">
        <div style={{ gridColumn: "1 / span 7" }}>
          <h1 className="vinyl vinyl--xl">This room is empty</h1>
          <p className="wall-text" style={{ marginTop: "var(--s-5)" }}>
            Nothing hangs at this address. The coordinate does not exist in the catalog, or the accession has been moved to cold storage.
          </p>
          <ul className="lost" style={{ marginTop: "var(--s-5)" }}>
            <li><Link href="/">Foyer</Link></li>
            {ROOMS.map((r) => <li key={r.id}><Link href={r.href}>{r.full}</Link></li>)}
          </ul>
          <div style={{ marginTop: "var(--s-6)" }}>
            <Doorway to="studio" hint="Return to the Foyer exhibition" />
          </div>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <WallLabel
            accession="PK-4040"
            title="Uncharted Coordinates"
            year="2026"
            fields={[
              { k: "Medium", v: "Void / Unregistered URI route" },
              { k: "Status", v: "404 Not Found" },
              { k: "Remedy", v: "Navigate via the floor plan or ceiling rail" },
            ]}
            label="Curator note"
          />
        </div>
      </div>
    </Room>
  );
}
