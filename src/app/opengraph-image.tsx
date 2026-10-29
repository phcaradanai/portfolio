import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Phatcharadanai Kanyapan — Future Museum of Working Software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#0c0e18",
          color: "#f5f7ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#7cf5e6" }} />
            <span style={{ fontSize: "16px", letterSpacing: "0.14em", color: "#9efcf0", fontWeight: 700 }}>
              FUTURE MUSEUM OF WORKING SOFTWARE
            </span>
          </div>
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
            ACCESSION PK-2026 · BANGKOK
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "60px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1 }}>
            Phatcharadanai Kanyapan
          </div>
          <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.72)", maxWidth: "880px", lineHeight: 1.4 }}>
            Interactive 3D isometric exhibition of 21 verified software repositories, autonomous agent pipelines, and playable game studies.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: "24px" }}>
          <div style={{ display: "flex", gap: "28px", fontSize: "15px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
            <span>21 VERIFIED REPOSITORIES</span>
            <span>757 TEST FILES</span>
            <span>0 FABRICATED CLAIMS</span>
          </div>
          <span style={{ fontSize: "15px", color: "#ff6e5c", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "monospace" }}>
            ALL CLAIMS CHECKABLE
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
