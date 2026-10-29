/**
 * Fictional NuriTrack sites. Layout is derived from a few numbers per site so
 * docks, zones and buildings always agree with each other.
 */

import type { Building, Dock, ParkedTrailer, Site, SiteId, Vec2, Zone } from "./types";

/** Truck footprint in metres; local +z is forward, origin at the footprint centre. */
export const TRUCK = { length: 9.6, width: 2.5, trailer: 7.2 } as const;
/** World z of the shared highway that links every site gate. */
export const HIGHWAY_Z = 40;

interface SiteSpec {
  id: SiteId;
  code: string;
  name: string;
  kind: Site["kind"];
  origin: Vec2;
  size: Vec2;
  /** Main warehouse [width, depth, height]. */
  warehouse: [number, number, number];
  docksPerSide: number;
}

function buildSite(spec: SiteSpec, siteIndex: number): Site {
  const [W, D] = spec.size;
  const [w, d, h] = spec.warehouse;
  // Leave room north of the hall for docked trucks plus the north lane.
  const north = -D / 2 + 13;
  const south = north + d;
  const whZ = north + d / 2;
  const roads = { north: north - 11.5, south: south + 11.5, side: w / 2 + 4, highway: HIGHWAY_Z - spec.origin[1] };
  const gate: Vec2 = [W / 2 - 6, D / 2 - 2];
  const p = spec.id.toLowerCase();

  const buildings: Building[] = [
    { id: `${p}-wh`, kind: "warehouse", label: `${spec.name} main hall`, position: [0, whZ], size: [w, d, h] },
    { id: `${p}-office`, kind: "office", label: "Operations office", position: [-W / 2 + 8, -D / 2 + 6], size: [9, 6, 5] },
    { id: `${p}-gatehouse`, kind: "gatehouse", label: "Gatehouse", position: [gate[0] + 3.5, D / 2 - 1], size: [3, 3, 3] },
  ];

  // Inbound docks on the south face (trucks face +z), outbound on the north face (trucks face -z).
  const docks: Dock[] = [];
  for (let i = 0; i < spec.docksPerSide; i++) {
    const x = -w / 2 + ((i + 0.5) * w) / spec.docksPerSide;
    docks.push({ id: `${spec.code}-IN${i + 1}`, buildingId: `${p}-wh`, side: "inbound", position: [x, south], heading: 0 });
    docks.push({ id: `${spec.code}-OUT${i + 1}`, buildingId: `${p}-wh`, side: "outbound", position: [x, north], heading: Math.PI });
  }

  // Yard: one row of nose-out slots between the south lane and the fence, west of the gate.
  const yardZ0 = roads.south + 2.5;
  const yardZ1 = D / 2 - 1.5;
  const yardX0 = -W / 2 + 4;
  const yardX1 = gate[0] - 7;
  const yardSlots: Vec2[] = [];
  for (let x = yardX0 + 1.8; x <= yardX1 - 1.8; x += 3.6) yardSlots.push([x, (yardZ0 + yardZ1) / 2]);

  // Drop trailers parked side by side east and west of the hall.
  const trailers: ParkedTrailer[] = [];
  const parkZ0 = -D / 2 + 11;
  const parkZ1 = roads.south - 2.5;
  for (const [x0, x1] of [[roads.side + 3, W / 2 - 2], [-W / 2 + 2, -roads.side - 3]] as const) {
    const cols = Math.floor((x1 - x0) / 8.5);
    for (let c = 0; c < cols; c++) {
      for (let z = parkZ0 + 1.7; z <= parkZ1 - 1.7; z += 3.4) {
        const i = trailers.length;
        trailers.push({ id: `${spec.code}-TL${String(i + 1).padStart(2, "0")}`, position: [x0 + 4.25 + c * 8.5, z], heading: Math.PI / 2, livery: (i * 5 + siteIndex) % 6 });
      }
    }
  }

  const zones: Zone[] = [
    { id: `${p}-gate`, kind: "gate", label: "Gate", rect: [gate[0], D / 2 - 4, 8, 8] },
    { id: `${p}-yard`, kind: "yard", label: "Truck yard", rect: [(yardX0 + yardX1) / 2, (yardZ0 + yardZ1) / 2, yardX1 - yardX0, yardZ1 - yardZ0] },
    { id: `${p}-recv`, kind: "receiving", label: "Inbound docks", rect: [0, south + 5, w, 10] },
    { id: `${p}-out`, kind: "outbound", label: "Outbound docks", rect: [0, north - 5, w, 10] },
    { id: `${p}-store`, kind: "storage", label: "Storage & sort", rect: [0, whZ, w, d] },
  ];

  return { id: spec.id, code: spec.code, name: spec.name, kind: spec.kind, origin: spec.origin, size: spec.size, zones, buildings, docks, roads, gate, yardSlots, trailers };
}

export const SITES: Site[] = ([
  { id: "ICN-FC", code: "IC-FC", name: "Icheon Fulfillment Center", kind: "fulfillment", origin: [-120, 0], size: [72, 56], warehouse: [32, 16, 10], docksPerSide: 4 },
  { id: "GJ-01", code: "GJ-01", name: "Gonjiam Mega Hub", kind: "megahub", origin: [0, 0], size: [84, 60], warehouse: [44, 20, 9], docksPerSide: 6 },
  { id: "ICN-ST", code: "IC-ST", name: "Incheon Sub-terminal", kind: "subterminal", origin: [120, 0], size: [64, 54], warehouse: [28, 14, 7], docksPerSide: 3 },
] satisfies SiteSpec[]).map(buildSite);

export const SITE_BY_ID = Object.fromEntries(SITES.map((s) => [s.id, s])) as Record<SiteId, Site>;

/** Fleet size per site: [trucks, forklifts, amrs]. */
export const FLEET: Record<SiteId, [number, number, number]> = {
  "ICN-FC": [18, 6, 12],
  "GJ-01": [32, 8, 0],
  "ICN-ST": [14, 4, 0],
};

export const RECIPIENTS = [
  "Lee Su-min", "Park Ji-ho", "Kim Ha-eun", "Choi Do-yun", "Jung Seo-yeon",
  "Kang Min-jun", "Yoon Ji-woo", "Han Ye-jin", "Lim Tae-yang", "Oh Na-rae",
];

export const ADDRESSES = [
  "Nuri Village Apt Bldg 101 Unit 702",
  "Nuri Village Apt Bldg 104 Unit 1203",
  "Nuri Village Row House 7",
  "Nuri Village Apt Bldg 102 Unit 305",
  "Nuri Village Shop Lane 12",
];

export const NOTES = [
  "Don't leave it at the door, security office only",
  "Call before delivery",
  "Leave in smart locker",
  "Fragile: keep upright",
  "",
];
