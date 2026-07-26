import { ImageResponse } from "next/og";
import { CONTACT } from "@/lib/site";

// Branded 1200×630 link-preview card, generated at request time by Next's
// file-based metadata convention. Replaces the old /images/products/abs.jpg
// placeholder referenced from layout.tsx.
export const alt = `${CONTACT.brand} — recycled ABS · HIPS · PP · GPPS pellets`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #065f46 0%, #047857 55%, #059669 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.16)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            GP
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            {CONTACT.brand}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.15, letterSpacing: -2 }}>
            Recycled ABS · HIPS · PP · GPPS Pellets
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#d1fae5", lineHeight: 1.4 }}>
            Factory-direct from Ningbo, China to injection molders across Southeast Asia
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["1-ton MOQ", "Batch COA", "Direct-from-owner pricing"].map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
