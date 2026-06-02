"use client";

import { QRCodeSVG } from "qrcode.react";

interface PosterFields {
  poster_title: string;
  nombre: string;
  raza: string;
  peso_kg: string;
  lost_location: string;
  lost_notes: string;
  poster_contact: string;
  poster_reward_amount: string;
  photoUrl: string;
  profileUrl: string;
}

interface Props {
  fields: PosterFields;
  id?: string;
}

function HeaderWave() {
  return (
    <svg viewBox="0 0 2480 160" preserveAspectRatio="none" style={{ position: "absolute", bottom: -1, left: 0, width: "100%", height: 160 }}>
      <path d="M0,80 Q620,160 1240,80 T2480,80 L2480,160 L0,160 Z" fill="#ffffff" />
    </svg>
  );
}

function PawBg({ x, y, size = 120, opacity = 0.04 }: { x: number; y: number; size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: x, top: y, opacity }}>
      <path d="M12 14.5c-3 0-5.5 1.5-6.5 3.5-.5 1-.5 2 .5 2.5 1.5.8 4 .5 6-.5 2 1 4.5 1.3 6 .5 1-.5 1-1.5.5-2.5-1-2-3.5-3.5-6.5-3.5z" fill="#4a47d4" />
      <ellipse cx="7.5" cy="9" rx="2.5" ry="3" fill="#4a47d4" />
      <ellipse cx="16.5" cy="9" rx="2.5" ry="3" fill="#4a47d4" />
      <ellipse cx="5.5" cy="13" rx="2" ry="2.5" fill="#4a47d4" />
      <ellipse cx="18.5" cy="13" rx="2" ry="2.5" fill="#4a47d4" />
    </svg>
  );
}

function DecoRing({ x, y, size = 280 }: { x: number; y: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", left: x, top: y, opacity: 0.06 }}>
      <circle cx="100" cy="100" r="90" fill="none" stroke="#4a47d4" strokeWidth="4" strokeDasharray="12 12" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 6" />
    </svg>
  );
}

function StarIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.87 12.87 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.87 12.87 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
    </svg>
  );
}

function MapPinIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" fill="#dc2626" />
    </svg>
  );
}

function NoteIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
      <path d="M8 12h8M8 16h5" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BlisBadge() {
  return (
    <svg width="280" height="60" viewBox="0 0 280 60">
      <rect x="0" y="0" width="280" height="60" rx="30" fill="#6b63f3" />
      <text x="140" y="40" textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">BLIS CLUB</text>
    </svg>
  );
}

export function PosterCanvas({ fields, id }: Props) {
  const f = fields;
  const photoSrc = f.photoUrl ? f.photoUrl.replace(/ /g, "%20") : null;

  return (
    <div
      id={id}
      style={{
        width: 2480,
        minHeight: 3508,
        background: "#ffffff",
        fontFamily: "'Nunito', 'Quicksand', system-ui, -apple-system, sans-serif",
        color: "#1e1b4b",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Background paw prints */}
      <PawBg x={100} y={500} size={160} opacity={0.035} />
      <PawBg x={2100} y={800} size={140} opacity={0.03} />
      <PawBg x={160} y={2200} size={120} opacity={0.025} />
      <PawBg x={2000} y={2600} size={150} opacity={0.03} />
      <PawBg x={400} y={3200} size={110} opacity={0.02} />
      <PawBg x={1900} y={3400} size={130} opacity={0.025} />

      {/* Decorative rings */}
      <DecoRing x={-60} y={620} size={340} />
      <DecoRing x={2100} y={580} size={300} />
      <DecoRing x={120} y={2600} size={320} />

      {/* ═══════ HEADER ═══════ */}
      <div style={{
        width: "100%",
        position: "relative",
        background: "linear-gradient(135deg, #6b63f3 0%, #4a47d4 40%, #7c3aed 100%)",
        padding: "80px 120px 200px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}>
        {/* Top badge */}
        <div style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          padding: "16px 52px",
          borderRadius: 80,
          border: "2px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <span style={{ fontSize: 40 }}>🆘</span>
          <span style={{ color: "white", fontSize: 32, fontWeight: 900, letterSpacing: "0.1em" }}>
            SE BUSCA
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <span style={{ fontSize: 100 }}>🔴</span>
          <span style={{
            color: "white",
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textShadow: "0 6px 32px rgba(0,0,0,0.3)",
          }}>
            {f.poster_title}
          </span>
        </div>

        <HeaderWave />
      </div>

      {/* ═══════ PHOTO ═══════ */}
      <div style={{
        marginTop: -100,
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{
          width: 1600,
          height: 1600,
          borderRadius: 80,
          overflow: "hidden",
          border: "10px solid #ffffff",
          backgroundColor: "#f5f3ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 40px 100px rgba(107,99,243,0.25), 0 0 0 24px #ede9fe",
        }}>
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={f.nombre}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <span style={{ fontSize: 260 }}>🐾</span>
          )}
        </div>
      </div>

      {/* ═══════ NAME & TAGS ═══════ */}
      <div style={{ textAlign: "center", padding: "72px 120px 28px", width: "100%", boxSizing: "border-box" }}>
        <p style={{
          fontSize: 180,
          fontWeight: 900,
          margin: 0,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          color: "#1e1b4b",
          textShadow: "0 3px 12px rgba(0,0,0,0.08)",
        }}>
          {f.nombre}
        </p>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginTop: 36,
          flexWrap: "wrap",
        }}>
          <Tag label={f.raza} icon="🐕" />
          <Tag label={`${f.peso_kg} kg`} icon="⚖️" />
        </div>
      </div>

      {/* Divider wave */}
      <svg viewBox="0 0 2480 80" preserveAspectRatio="none" style={{ width: "calc(100% - 240px)", height: 80, margin: "28px 0" }}>
        <path d="M0,40 Q620,80 1240,40 T2480,40" fill="none" stroke="#e8e5ff" strokeWidth="8" strokeLinecap="round" />
      </svg>

      {/* ═══════ DETAIL CARDS ═══════ */}
      <div style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "0 160px 56px",
        display: "flex",
        flexDirection: "column",
        gap: 40,
        alignItems: "center",
      }}>
        {f.lost_location && (
          <DetailCard
            svg={<MapPinIcon size={80} />}
            label="ULTIMA VEZ VISTO"
            value={f.lost_location}
            bg="#fef2f2"
            border="#fecaca"
            valueColor="#dc2626"
          />
        )}

        {f.lost_notes && (
          <DetailCard
            svg={<NoteIcon size={80} />}
            label="NOTAS / SENAS PARTICULARES"
            value={f.lost_notes}
            bg="#f5f3ff"
            border="#ddd6fe"
            valueColor="#5b21b6"
          />
        )}

        {f.poster_contact && (
          <DetailCard
            svg={<PhoneIcon size={80} />}
            label="CONTACTO"
            value={f.poster_contact}
            bg="#f0fdf4"
            border="#bbf7d0"
            valueColor="#15803d"
          />
        )}
      </div>

      {/* ═══════ REWARD ═══════ */}
      {f.poster_reward_amount && (
        <div style={{
          width: "calc(100% - 320px)",
          background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)",
          padding: "56px 80px",
          borderRadius: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          marginBottom: 56,
          boxShadow: "0 16px 56px rgba(251,191,36,0.45), inset 0 -6px 0 rgba(0,0,0,0.08)",
        }}>
          <StarIcon size={100} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 40, fontWeight: 900, color: "#92400e", margin: "0 0 8px 0", letterSpacing: "0.08em" }}>
              RECOMPENSA
            </p>
            <p style={{ fontSize: 90, fontWeight: 900, color: "#78350f", margin: 0 }}>
              {f.poster_reward_amount}
            </p>
          </div>
          <StarIcon size={100} />
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ═══════ FOOTER ═══════ */}
      <div style={{
        width: "100%",
        boxSizing: "border-box",
        borderTop: "8px solid #ede9fe",
        padding: "64px 160px 96px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 64,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#1e1b4b",
            margin: "0 0 14px 0",
          }}>
            Escanea el QR para ver el perfil
          </p>
          <p style={{
            fontSize: 28,
            color: "#9ca3af",
            margin: "0 0 20px 0",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}>
            {f.profileUrl}
          </p>
          <div style={{ marginTop: 12 }}>
            <BlisBadge />
          </div>
        </div>

        <div style={{
          background: "white",
          padding: 28,
          borderRadius: 40,
          border: "8px solid #e8e5ff",
          flexShrink: 0,
          boxShadow: "0 8px 40px rgba(107,99,243,0.18)",
        }}>
          <QRCodeSVG
            value={f.profileUrl}
            size={220}
            level="M"
            fgColor="#4a47d4"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Tag({ label, icon }: { label: string; icon: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      background: "#f5f3ff",
      padding: "18px 44px",
      borderRadius: 80,
      fontSize: 44,
      fontWeight: 800,
      color: "#4a47d4",
      border: "4px solid #ddd6fe",
    }}>
      <span style={{ fontSize: 48 }}>{icon}</span> {label}
    </span>
  );
}

function DetailCard({
  svg,
  label,
  value,
  bg,
  border,
  valueColor,
}: {
  svg: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  border: string;
  valueColor: string;
}) {
  return (
    <div style={{
      width: "100%",
      maxWidth: 2160,
      display: "flex",
      alignItems: "flex-start",
      gap: 36,
      background: bg,
      border: `6px solid ${border}`,
      borderRadius: 48,
      padding: "48px 60px",
      boxShadow: "0 6px 28px rgba(0,0,0,0.05)",
    }}>
      <div style={{ flexShrink: 0, marginTop: 6 }}>{svg}</div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 28,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#9ca3af",
          margin: "0 0 14px 0",
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 56,
          fontWeight: 800,
          color: valueColor,
          margin: 0,
          lineHeight: 1.35,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
