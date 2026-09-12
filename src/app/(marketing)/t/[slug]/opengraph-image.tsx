import { ImageResponse } from "next/og";
import { getContactBySlug, TIPO } from "@/lib/publicTaller";

export const runtime = "nodejs";
export const alt = "Blis Club Auto - Taller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getContactBySlug(slug);

  const nombre = c?.nombre || "Taller";
  const tipo = TIPO[c?.tipo || ""] || "Taller";
  const encargado = c?.encargado || null;
  const foto = c?.foto_url || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 44,
          padding: 56,
          background: "linear-gradient(135deg, #070a18 0%, #0b1226 55%, #0e1428 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 452,
            height: 452,
            borderRadius: 36,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0e1428, #131a33)",
            border: "2px solid rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        >
          {foto ? (
            <img
              src={foto}
              width={452}
              height={452}
              style={{ objectFit: "cover", width: 452, height: 452 }}
            />
          ) : (
            <div style={{ fontSize: 220, fontWeight: 900, color: "#34d399" }}>B</div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                color: "#ffffff",
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              B
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#e4e4e7", fontSize: 32, fontWeight: 800 }}>
                Blis Club Auto
              </div>
              <div style={{ color: "#71717a", fontSize: 22 }}>Taller compartido</div>
            </div>
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 62,
              fontWeight: 900,
              lineHeight: 1.06,
              display: "flex",
            }}
          >
            {nombre}
          </div>

          <div style={{ color: "#34d399", fontSize: 30, fontWeight: 700, marginTop: 16 }}>
            {tipo}
          </div>

          {encargado ? (
            <div style={{ color: "#a1a1aa", fontSize: 26, marginTop: 8 }}>
              {`Atiende: ${encargado}`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}
