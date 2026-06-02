"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PawPrint, MapPin, Phone, Calendar, Scale, AlertTriangle, Heart, MessageCircle, Shield, Clock, Info, Share2, ZoomIn } from "lucide-react";

interface Dog {
  id: string;
  nombre: string;
  raza: string;
  edad_meses: number;
  peso_kg: number;
  foto_url: string | null;
  breed_image_url: string | null;
  is_lost: boolean;
  lost_since: string | null;
  lost_location: string | null;
  lost_notes: string | null;
  poster_title: string | null;
  poster_photo_url: string | null;
  poster_contact: string | null;
  poster_reward_amount: string | null;
}

interface Props {
  dog: Dog;
  shareUrl: string;
}

function getEdadTexto(meses: number): string {
  if (meses < 12) return `${meses} meses`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios} año${anios > 1 ? "s" : ""}${resto > 0 ? ` y ${resto} meses` : ""}`;
}

/* ═══════ ANIMATED COMPONENTS ═══════ */

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  );
}

function HeroBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={{ opacity: 0.12 }}>
      <path fill="#ffffff" d="M44.7,-76.4C58.9,-71.2,71.8,-59.1,79.6,-44.6C87.4,-30.1,90.1,-13.2,86.6,1.9C83.1,17,73.4,30.3,62.7,41.2C52,52.1,40.3,60.6,27.5,65.8C14.7,71,0.8,72.9,-12.4,70.3C-25.6,67.7,-38.1,60.6,-49.3,51.4C-60.5,42.2,-70.4,30.9,-76.1,17.2C-81.8,3.5,-83.3,-12.6,-79.2,-27.1C-75.1,-41.6,-65.4,-54.5,-53.3,-61.5C-41.2,-68.5,-26.7,-69.6,-12.7,-70.7C1.3,-71.8,15.2,-72.9,30.5,-81.6L44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
  );
}

function FloatingCircle({ size = 200, delay = 0, className }: { size?: number; delay?: number; className?: string }) {
  return (
    <div
      className={`absolute rounded-full bg-white/10 ${className || ""}`}
      style={{
        width: size,
        height: size,
        animation: `float 6s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function PublicProfileClient({ dog, shareUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const photoUrl = dog.poster_photo_url || dog.foto_url || dog.breed_image_url;
  const edadTexto = getEdadTexto(dog.edad_meses);
  const waText = encodeURIComponent(
    `${dog.is_lost ? "🚨 PERRO PERDIDO" : "🐾 Perfil de"} ${dog.nombre}\n\n` +
    `${dog.raza} · ${edadTexto} · ${dog.peso_kg} kg\n` +
    `${dog.is_lost && dog.lost_location ? `📍 ${dog.lost_location}\n` : ""}` +
    `\n${shareUrl}`
  );
  const isLost = dog.is_lost;

  return (
    <div className="min-h-screen bg-app-gradient">
      {/* ═══════ GLOBAL ANIMATIONS ═══════ */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>

      {/* ═══════ EMERGENCY BANNER ═══════ */}
      {isLost && (
        <div className="bg-red-600 text-white animate-slide-down">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center gap-3 text-sm font-bold">
            <PulseDot />
            <span>{dog.poster_title || "PERRO PERDIDO"}</span>
            {dog.lost_since && (
              <span className="text-white/70 text-xs font-medium">
                Desde {new Date(dog.lost_since).toLocaleDateString("es-ES")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══════ HERO ═══════ */}
      <div className={`relative overflow-hidden pt-10 pb-20 px-4 ${isLost ? "bg-gradient-to-br from-red-500 via-red-600 to-red-800" : "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800"}`}>
        <HeroBlob className="absolute -top-10 -right-20 w-64 h-64" />
        <HeroBlob className="absolute top-20 -left-16 w-48 h-48" />
        <HeroBlob className="absolute bottom-10 right-10 w-40 h-40" />
        <FloatingCircle size={180} delay={0} className="top-16 right-1/4" />
        <FloatingCircle size={120} delay={1.5} className="bottom-20 left-1/3" />

        <div className="max-w-lg mx-auto flex flex-col items-center relative z-10">
          {/* Photo with ring */}
          <FadeIn delay={0}>
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isLost ? "bg-red-400" : "bg-primary-300"}`} style={{ transform: "scale(1.15)" }} />
              <div className="w-44 h-44 rounded-[2.5rem] bg-white/20 backdrop-blur-md border-[3px] border-white/30 overflow-hidden shadow-2xl relative">
                {photoUrl ? (
                  <img src={photoUrl.replace(/ /g, "%20")} alt={dog.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-16 h-16 text-white/60" />
                  </div>
                )}
              </div>
              {isLost && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </FadeIn>

          {/* Name */}
          <FadeIn delay={100}>
            <h1 className="mt-6 text-4xl font-black text-white text-center tracking-tight" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
              {dog.nombre}
            </h1>
          </FadeIn>

          {/* Tags */}
          <FadeIn delay={200}>
            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
              {[
                { icon: "🐕", text: dog.raza },
                { icon: "🎂", text: edadTexto },
                { icon: "⚖️", text: `${dog.peso_kg} kg` },
              ].map((tag, i) => (
                <span key={i} className="bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                  {tag.icon} {tag.text}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Wave separator */}
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" style={{ height: 60 }}>
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" fill={isLost ? "#fef2f2" : "#f5f3ff"} />
        </svg>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className={`max-w-lg mx-auto px-4 -mt-4 space-y-4 relative z-10 pb-12 ${isLost ? "bg-red-50/30" : ""}`}>

        {/* Lost details */}
        {isLost && (
          <div className="space-y-3">
            {dog.lost_location && (
              <FadeIn delay={300}>
                <div className="group card-elevated rounded-2xl p-5 border-l-[5px] border-red-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Ultima vez visto</p>
                      <p className="text-lg font-bold text-zinc-800">{dog.lost_location}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {dog.lost_notes && (
              <FadeIn delay={400}>
                <div className="group card-elevated rounded-2xl p-5 border-l-[5px] border-primary-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Info className="w-6 h-6 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-1">Notas / Senas particulares</p>
                      <p className="text-base text-zinc-700 leading-relaxed">{dog.lost_notes}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {dog.poster_contact && (
              <FadeIn delay={500}>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola, vi a ${dog.nombre}`)}`}
                  target="_blank"
                  rel="noopener"
                  className="group card-elevated rounded-2xl p-5 flex items-center gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] border-l-[5px] border-green-400"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Contacto</p>
                    <p className="text-lg font-bold text-zinc-800">{dog.poster_contact}</p>
                  </div>
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </a>
              </FadeIn>
            )}

            {dog.poster_reward_amount && (
              <FadeIn delay={600}>
                <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 border-2 border-amber-300 text-center shadow-lg shadow-amber-200/40 hover:shadow-xl hover:shadow-amber-200/60 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Recompensa</p>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p className="text-4xl font-black text-amber-700">{dog.poster_reward_amount}</p>
                </div>
              </FadeIn>
            )}
          </div>
        )}

        {/* Safe banner */}
        {!isLost && (
          <FadeIn delay={300}>
            <div className="rounded-2xl p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Heart className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-bold text-green-700 text-lg">{dog.nombre} esta a salvo en casa</p>
              <p className="text-sm text-green-600 mt-1">
                Este QR esta en su collar por seguridad. Escanealo si lo encuentras.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Tips */}
        {isLost && (
          <FadeIn delay={700}>
            <div className="card-soft rounded-2xl p-5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs">💡</span>
                Si lo encontraste
              </p>
              <div className="space-y-3">
                {[
                  "No lo asustes, acércate con calma y habla suave.",
                  "Revisa si tiene chapita o collar con teléfono.",
                  "Escanea el QR de abajo para contactar a su familia.",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-zinc-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Actions */}
        <FadeIn delay={isLost ? 800 : 400}>
          <div className="card-elevated rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {isLost ? "Lo viste?" : "Compartir"}
            </p>

            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              {isLost ? "Avisar por WhatsApp" : "Compartir en WhatsApp"}
            </a>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: `${dog.nombre} - ${dog.raza}`,
                    text: `${isLost ? "🚨 PERRO PERDIDO" : "🐾 Perfil de"} ${dog.nombre}`,
                    url: shareUrl,
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all"
            >
              <Share2 className="w-5 h-5" />
              Compartir perfil
            </button>
          </div>
        </FadeIn>

        {/* QR */}
        <FadeIn delay={isLost ? 900 : 500}>
          <div className="card-elevated rounded-2xl p-6 text-center space-y-4">
            <div className="inline-flex p-3 bg-white rounded-2xl border-2 border-primary-100 shadow-lg">
              <QRCodeSVG value={shareUrl} size={160} level="M" fgColor="#4a47d4" />
            </div>
            <p className="text-xs text-zinc-400">Escanea este QR para ver el perfil completo</p>
            <p className="text-[10px] text-zinc-300 break-all font-mono">{shareUrl}</p>
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={isLost ? 1000 : 600}>
          <div className="text-center pt-4 pb-6">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-primary-100 dark:border-primary-800/30 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Blis Club</span>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-3">
              Seguridad para tu perro, tranquilidad para ti.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
