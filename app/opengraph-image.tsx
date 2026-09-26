import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default async function Image() {
  const profile = await getProfile().catch(() => null);
  const name = profile?.name ?? "Software Engineer Portfolio";
  const tagline = profile?.tagline ?? "Software Engineer — .NET / Backend Systems";
  const host = new URL(siteUrl).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #0b1120 0%, #0f1f3a 55%, #0b3b3a 100%)",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 700,
            color: "#0b1120",
            background: "linear-gradient(135deg, #34d399 0%, #38bdf8 100%)",
            border: "6px solid #3b82f6",
            flexShrink: 0,
          }}
        >
          {getInitials(name)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#34d399", letterSpacing: 4 }}>
            PORTFOLIO
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 14,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#94a3b8",
              lineHeight: 1.3,
              marginTop: 20,
            }}
          >
            {tagline}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#38bdf8", marginTop: 40 }}>
            {host}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
