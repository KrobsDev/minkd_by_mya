import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Mink'd by Mya";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "images", "logo.PNG")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #1a0b0f 0%, #4a1528 45%, #f3c6d3 100%)",
          color: "#fff7fb",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.15), transparent 35%), radial-gradient(circle at bottom right, rgba(255,192,203,0.22), transparent 30%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 72px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 28,
                background: "rgba(255,255,255,0.96)",
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              }}
            >
              <img
                src={logoSrc}
                alt="Mink'd by Mya logo"
                width={80}
                height={80}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
              }}
            >
              <span style={{ opacity: 0.78 }}>Luxury Lash and Beauty Studio</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 840,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 78,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: -2,
              }}
            >
              Mink&apos;d by Mya
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                lineHeight: 1.25,
                color: "#ffe3ee",
                maxWidth: 780,
              }}
            >
              Flawless, personalized beauty services in Accra.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#fff0f6",
            }}
          >
            <span>Appointments for lashes, brows, lips, and touch-ups</span>
            <span style={{ opacity: 0.88 }}>minkdbymya.com</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
