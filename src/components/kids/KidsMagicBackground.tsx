// Fondo mágico de Kids Club — multicapa, transparente y con movimiento sutil.
// Solo CSS (transform/opacity) para no afectar el rendimiento ni la lectura.

const STARS = [
  { top: "6%", left: "8%", size: 22, delay: "0s" },
  { top: "12%", left: "26%", size: 14, delay: "0.6s" },
  { top: "8%", left: "48%", size: 18, delay: "1.2s" },
  { top: "15%", left: "66%", size: 12, delay: "0.3s" },
  { top: "9%", left: "82%", size: 20, delay: "1.8s" },
  { top: "26%", left: "14%", size: 16, delay: "1s" },
  { top: "30%", left: "40%", size: 12, delay: "2.2s" },
  { top: "24%", left: "58%", size: 22, delay: "0.4s" },
  { top: "34%", left: "88%", size: 16, delay: "1.4s" },
  { top: "44%", left: "6%", size: 18, delay: "2.6s" },
  { top: "48%", left: "30%", size: 12, delay: "0.9s" },
  { top: "52%", left: "52%", size: 20, delay: "1.9s" },
  { top: "46%", left: "78%", size: 14, delay: "0.2s" },
  { top: "62%", left: "18%", size: 16, delay: "1.6s" },
  { top: "66%", left: "42%", size: 12, delay: "2.8s" },
  { top: "60%", left: "70%", size: 22, delay: "0.7s" },
  { top: "72%", left: "10%", size: 14, delay: "2.1s" },
  { top: "78%", left: "34%", size: 18, delay: "1.1s" },
  { top: "74%", left: "60%", size: 12, delay: "2.4s" },
  { top: "82%", left: "84%", size: 18, delay: "0.5s" },
  { top: "88%", left: "22%", size: 14, delay: "1.7s" },
  { top: "92%", left: "50%", size: 20, delay: "0.8s" },
  { top: "86%", left: "72%", size: 12, delay: "2.3s" },
  { top: "95%", left: "90%", size: 16, delay: "1.3s" },
];

const SPARKLES = [
  { top: "18%", left: "36%", size: 16, delay: "0.2s" },
  { top: "38%", left: "72%", size: 14, delay: "1.5s" },
  { top: "58%", left: "24%", size: 18, delay: "0.9s" },
  { top: "68%", left: "56%", size: 12, delay: "2.1s" },
  { top: "28%", left: "92%", size: 14, delay: "1.1s" },
  { top: "80%", left: "44%", size: 16, delay: "0.6s" },
  { top: "50%", left: "94%", size: 12, delay: "1.9s" },
  { top: "14%", left: "92%", size: 14, delay: "2.5s" },
];

const ORBS = [
  { top: "20%", left: "70%", size: 180, color: "rgba(168,85,247,0.16)" },
  { top: "60%", left: "8%", size: 220, color: "rgba(56,189,248,0.14)" },
  { top: "78%", left: "62%", size: 200, color: "rgba(236,72,153,0.12)" },
];

const CLOUDS = [
  { top: "12%", size: 220, opacity: 0.5, duration: 95, delay: -20 },
  { top: "30%", size: 300, opacity: 0.35, duration: 130, delay: -70 },
  { top: "52%", size: 260, opacity: 0.32, duration: 110, delay: -45 },
  { top: "70%", size: 340, opacity: 0.28, duration: 150, delay: -100 },
];

const SHOOTERS = [
  { top: "8%", left: "72%", duration: 9, delay: 0, width: 130 },
  { top: "26%", left: "86%", duration: 12, delay: 3.5, width: 100 },
  { top: "44%", left: "64%", duration: 14, delay: 7, width: 150 },
];

function Star({ size, className, style }: { size: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 2l2.7 6.3 6.8.6-5.1 4.5 1.5 6.6L12 16.9 6.1 20l1.5-6.6L2.5 8.9l6.8-.6z" />
    </svg>
  );
}

function Sparkle({ size, className, style }: { size: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 1c.6 5 1.4 6.4 6.5 7-5.1.6-5.9 2-6.5 7-.6-5-1.4-6.4-6.5-7C10.6 7.4 11.4 6 12 1z" />
    </svg>
  );
}

export function KidsMagicBackground() {
  return (
    <div aria-hidden className="bg-kids-gradient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Textura estelar (puntitos muy sutiles) */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(124,58,237,0.35) 1px, transparent 1.4px)",
          backgroundSize: "46px 46px",
        }}
      />

      {/* Auroras en la parte inferior */}
      <div
        className="absolute -bottom-24 -left-1/4 h-[46vh] w-[150vw] animate-aurora rounded-[50%] blur-3xl"
        style={{ background: "radial-gradient(60% 100% at 40% 100%, rgba(56,189,248,0.35), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -right-1/4 h-[42vh] w-[150vw] animate-aurora rounded-[50%] blur-3xl"
        style={{ background: "radial-gradient(60% 100% at 60% 100%, rgba(236,72,153,0.32), transparent 70%)", animationDelay: "4s" }}
      />

      {/* Nubes que se desplazan */}
      {CLOUDS.map((c, i) => (
        <div
          key={`c-${i}`}
          className="absolute animate-cloud rounded-full blur-2xl"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.42,
            opacity: c.opacity,
            background: "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,255,255,0) 75%)",
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Orbes de color */}
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="absolute animate-drift rounded-full blur-3xl"
          style={{ top: o.top, left: o.left, width: o.size, height: o.size, background: o.color, animationDelay: `${i * 1.5}s` }}
        />
      ))}

      {/* Luna */}
      <div className="absolute right-8 top-6 animate-float-slow text-amber-300/70">
        <svg width="58" height="58" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M15 2a10 10 0 1 0 7 17 8 8 0 0 1-7-17z" />
        </svg>
      </div>

      {/* Estrellas y destellos */}
      {STARS.map((s, i) => (
        <Star key={`s-${i}`} size={s.size} className="absolute text-violet-400/60 animate-twinkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
      ))}
      {SPARKLES.map((s, i) => (
        <Sparkle key={`sp-${i}`} size={s.size} className="absolute text-amber-400/70 animate-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
      ))}

      {/* Estrellas fugaces */}
      {SHOOTERS.map((s, i) => (
        <span
          key={`sh-${i}`}
          className="absolute animate-shoot rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.width,
            height: 2,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9))",
            boxShadow: "0 0 8px 2px rgba(255,255,255,0.5)",
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
