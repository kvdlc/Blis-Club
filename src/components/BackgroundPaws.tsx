"use client";

const ICONS = [
  "/icons/huella.svg",
  "/icons/hueso.svg",
  "/icons/cabeza de perro.svg",
  "/icons/cuerpo de perro.svg",
];

const POSITIONS = [
  { top: "5%", left: "3%", size: 60, rotate: 15, opacity: 0.03, delay: 0 },
  { top: "12%", right: "5%", size: 48, rotate: -20, opacity: 0.035, delay: 0.5 },
  { top: "25%", left: "8%", size: 44, rotate: 35, opacity: 0.025, delay: 1 },
  { top: "35%", right: "3%", size: 72, rotate: -10, opacity: 0.02, delay: 0.3 },
  { top: "50%", left: "4%", size: 52, rotate: -30, opacity: 0.03, delay: 1.5 },
  { top: "60%", right: "7%", size: 40, rotate: 20, opacity: 0.025, delay: 0.8 },
  { top: "72%", left: "6%", size: 64, rotate: -15, opacity: 0.02, delay: 0.2 },
  { bottom: "15%", right: "4%", size: 56, rotate: 25, opacity: 0.03, delay: 1.2 },
  { bottom: "8%", left: "10%", size: 48, rotate: -5, opacity: 0.025, delay: 0.7 },
];

export function BackgroundPaws() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {POSITIONS.map((pos, i) => {
        const src = ICONS[i % ICONS.length];
        return (
          <img
            key={i}
            src={src}
            alt=""
            width={pos.size}
            height={pos.size}
            style={{
              position: "absolute",
              top: pos.top,
              right: "right" in pos ? pos.right : undefined,
              left: "left" in pos ? pos.left : undefined,
              bottom: "bottom" in pos ? pos.bottom : undefined,
              transform: `rotate(${pos.rotate}deg)`,
              opacity: pos.opacity,
              animation: `icon-pulse 6s ease-in-out ${pos.delay}s infinite`,
              filter: "brightness(0) saturate(100%)",
            }}
            className="dark:invert dark:opacity-30"
          />
        );
      })}
    </div>
  );
}
