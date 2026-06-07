"use client";

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  PawPrint, MapPin, Heart, MessageCircle, Share2, Award, Zap, Trophy,
  TrendingDown, Syringe, Utensils, Sparkles, Info, Phone, Mail, Download,
  Activity, Target, Ruler, Scale, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { AgilitySession, AgilitySessionObstacle, AgilityObstacle, DogPublicProfile, DogWeightHistory } from "@/types/database";

interface Dog {
  id: string;
  nombre: string;
  raza: string;
  edad_meses: number;
  peso_kg: number;
  foto_url: string | null;
  breed_image_url: string | null;
  is_lost: boolean;
  tamano?: string | null;
  objetivo_principal?: string | null;
}

interface MetabolicProfile {
  activity_level: string;
  allergies: string[];
  medical_conditions: string[];
  feeding_pct: number;
  diet_type?: string | null;
}

interface Props {
  dog: Dog;
  shareUrl: string;
  agilitySessions: AgilitySession[];
  agilityObstacles: Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]>;
  publicProfile: DogPublicProfile | null;
  metabolicProfile: MetabolicProfile | null;
  weightHistory: DogWeightHistory[];
  vaccines: { vaccine_name: string; dose_number: number; date_administered: string | null; next_due_date: string | null }[];
  userBadges: { badge: { name: string; icon_url: string | null; description: string | null; badge_type: string } }[];
}

/* ── Helpers ── */
function getEdadTexto(meses: number): string {
  if (meses < 12) return `${meses} meses`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios} año${anios > 1 ? "s" : ""}${resto > 0 ? ` y ${resto} meses` : ""}`;
}

function formatTime(seconds: number | null) {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: "Sedentario",
  moderado: "Moderado",
  activo: "Activo",
  atletico: "Atlético",
};

const DIET_LABELS: Record<string, string> = {
  barf: "BARF",
  croquetas: "Croquetas",
  mixta: "Mixta",
};

const SIZE_LABELS: Record<string, string> = {
  miniatura: "Miniatura",
  pequeno: "Pequeño",
  mediano: "Mediano",
  grande: "Grande",
  gigante: "Gigante",
};

/* ── Animation wrapper ── */
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

/* ── Section wrapper ── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`max-w-lg mx-auto px-4 ${className}`}>{children}</section>;
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-800">{title}</h3>
        {subtitle && <p className="text-[10px] text-zinc-400">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Photo Gallery Carousel ── */
function GalleryCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(0);
  const total = photos.length;
  if (total === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-100"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        }}
      >
        <img
          src={photos[idx].replace(/ /g, "%20")}
          alt={`Foto ${idx + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all">
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all">
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-white w-5" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function DogShowcaseProfile({
  dog, shareUrl, agilitySessions, agilityObstacles,
  publicProfile, metabolicProfile, weightHistory, vaccines, userBadges,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const vis = publicProfile?.sections_visible ?? {
    badges: true, gallery: true, stats: true, agility: true,
    weight: true, medical: true, diet: true, breeding: false, contact: false,
  };

  const photoUrl = dog.foto_url || dog.breed_image_url;
  const edadTexto = getEdadTexto(dog.edad_meses);
  const waText = encodeURIComponent(`🐾 Perfil de ${dog.nombre}\n\n${dog.raza} · ${edadTexto} · ${dog.peso_kg} kg\n\n${shareUrl}`);

  const bestCircuit = agilitySessions.length > 0
    ? Math.min(...agilitySessions.filter((s) => s.circuit_time_seconds).map((s) => s.circuit_time_seconds!))
    : null;

  const cleanRuns = agilitySessions.filter((s) => s.clean_run).length;
  const weightInitial = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].peso_kg : null;
  const weightDiff = weightInitial ? dog.peso_kg - weightInitial : null;

  const hasAnySection = vis.stats || vis.gallery || vis.badges || vis.agility || vis.weight || vis.medical || vis.diet || vis.contact;

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* ═══════ TOP BAR ═══════ */}
      <div className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">B</span>
          </div>
          <span className="text-xs font-bold text-primary-600 tracking-wide">BLIS CLUB · PERFIL CANINO</span>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pt-14 pb-24 px-4">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, white 1px, transparent 1px)`,
            backgroundSize: "60px 60px, 90px 90px, 70px 70px",
          }}
        />
        <div className="max-w-lg mx-auto flex flex-col items-center relative z-10">
          <FadeIn delay={0}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-primary-300" style={{ transform: "scale(1.2)" }} />
              <div className="w-48 h-48 rounded-[2.75rem] bg-white/15 backdrop-blur-md border-[3px] border-white/25 overflow-hidden shadow-2xl relative ring-4 ring-white/10">
                {photoUrl ? (
                  <img src={photoUrl.replace(/ /g, "%20")} alt={dog.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="mt-6 text-5xl font-black text-white text-center tracking-tight leading-tight" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
              {dog.nombre}
            </h1>
          </FadeIn>

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

          {publicProfile?.city && (
            <FadeIn delay={250}>
              <div className="mt-4 flex items-center gap-1.5 text-white/80 text-xs font-medium bg-white/10 px-4 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" />
                {publicProfile.city}
              </div>
            </FadeIn>
          )}
        </div>

        <svg viewBox="0 0 1440 80" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" style={{ height: 48 }}>
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="relative z-10 -mt-6 pb-16 space-y-8">

        {/* ── BIO ── */}
        {publicProfile?.bio && (
          <Section>
            <FadeIn delay={300}>
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed italic">
                  &ldquo;{publicProfile.bio}&rdquo;
                </p>
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── BUSCA NOVI@ ── */}
        {vis.breeding && publicProfile?.breeding_active && (
          <Section>
            <FadeIn delay={350}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-2 border-pink-200 p-6 text-center shadow-lg shadow-pink-100/50">
                <div className="absolute top-0 right-0 text-4xl opacity-20">💘</div>
                <div className="absolute bottom-0 left-0 text-3xl opacity-20">💕</div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-2xl">💘</span>
                    <h3 className="text-lg font-black text-pink-700">
                      {dog.nombre} busca {dog.nombre.endsWith("a") ? "Novio" : "Novia"}
                    </h3>
                    <span className="text-2xl">💘</span>
                  </div>

                  {publicProfile.breeding_inquiry_only ? (
                    <div className="mt-3 inline-flex items-center gap-2 bg-pink-100 rounded-full px-5 py-2">
                      <MessageCircle className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-bold text-pink-700">Consulta al interno</span>
                    </div>
                  ) : publicProfile.breeding_amount ? (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Valor de la Cita</p>
                      <p className="text-3xl font-black text-pink-700">
                        {publicProfile.breeding_currency} {publicProfile.breeding_amount}
                      </p>
                    </div>
                  ) : null}

                  {publicProfile.breeding_description && (
                    <p className="mt-3 text-sm text-zinc-600 leading-relaxed max-w-sm mx-auto">
                      {publicProfile.breeding_description}
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── STATS ── */}
        {vis.stats && (metabolicProfile || dog.tamano || dog.objetivo_principal) && (
          <Section>
            <FadeIn delay={400}>
              <SectionHeader icon={<Activity className="w-5 h-5 text-primary-500" />} title="Estadísticas" subtitle="Ficha técnica" />
              <div className="grid grid-cols-2 gap-3">
                {metabolicProfile && (
                  <StatCard icon={<Activity className="w-4 h-4" />} label="Actividad" value={ACTIVITY_LABELS[metabolicProfile.activity_level] ?? metabolicProfile.activity_level} color="blue" />
                )}
                {metabolicProfile?.diet_type && (
                  <StatCard icon={<Utensils className="w-4 h-4" />} label="Dieta" value={DIET_LABELS[metabolicProfile.diet_type] ?? metabolicProfile.diet_type} color="green" />
                )}
                {dog.tamano && (
                  <StatCard icon={<Ruler className="w-4 h-4" />} label="Tamaño" value={SIZE_LABELS[dog.tamano] ?? dog.tamano} color="purple" />
                )}
                {dog.objetivo_principal && (
                  <StatCard icon={<Target className="w-4 h-4" />} label="Objetivo" value={dog.objetivo_principal} color="amber" />
                )}
                {metabolicProfile && (
                  <StatCard icon={<Utensils className="w-4 h-4" />} label="Alimentación" value={`${metabolicProfile.feeding_pct}% peso`} color="teal" />
                )}
                {metabolicProfile?.allergies && metabolicProfile.allergies.length > 0 && (
                  <StatCard icon={<Info className="w-4 h-4" />} label="Alergias" value={metabolicProfile.allergies.join(", ")} color="orange" />
                )}
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── GALLERY ── */}
        {vis.gallery && publicProfile?.gallery_photos && publicProfile.gallery_photos.length > 0 && (
          <Section>
            <FadeIn delay={450}>
              <SectionHeader icon={<Sparkles className="w-5 h-5 text-primary-500" />} title="Galería" subtitle={`${publicProfile.gallery_photos.length} fotos`} />
              <GalleryCarousel photos={publicProfile.gallery_photos} />
            </FadeIn>
          </Section>
        )}

        {/* ── BADGES ── */}
        {vis.badges && userBadges.length > 0 && (
          <Section>
            <FadeIn delay={500}>
              <SectionHeader icon={<Award className="w-5 h-5 text-accent-500" />} title="Insignias" subtitle={`${userBadges.length} ganadas`} />
              <div className="grid grid-cols-3 gap-3">
                {userBadges.map((b, i) => (
                  <div key={i} className="card-soft rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-2">
                      {b.badge.icon_url ? (
                        <img src={b.badge.icon_url} alt={b.badge.name} className="w-7 h-7 object-contain" />
                      ) : (
                        <Award className="w-6 h-6 text-accent-500" />
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-700 leading-tight">{b.badge.name}</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5 capitalize">{b.badge.badge_type}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── AGILITY ── */}
        {vis.agility && agilitySessions.length > 0 && (
          <Section>
            <FadeIn delay={550}>
              <SectionHeader icon={<Zap className="w-5 h-5 text-accent-500" />} title="Agilidad" subtitle={`${agilitySessions.length} sesiones`} />
              <div className="grid grid-cols-3 gap-3 mb-3">
                {bestCircuit && (
                  <div className="card-soft rounded-xl p-3 text-center">
                    <Trophy className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                    <p className="text-[9px] text-zinc-400 uppercase">Mejor tiempo</p>
                    <p className="text-lg font-black text-zinc-800">{formatTime(bestCircuit)}s</p>
                  </div>
                )}
                <div className="card-soft rounded-xl p-3 text-center">
                  <Zap className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-[9px] text-zinc-400 uppercase">Sesiones</p>
                  <p className="text-lg font-black text-zinc-800">{agilitySessions.length}</p>
                </div>
                <div className="card-soft rounded-xl p-3 text-center">
                  <Sparkles className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-[9px] text-zinc-400 uppercase">Clean Runs</p>
                  <p className="text-lg font-black text-zinc-800">{cleanRuns}</p>
                </div>
              </div>
              {agilitySessions.slice(0, 3).map((s) => {
                const obstacles = agilityObstacles[s.id] || [];
                return (
                  <div key={s.id} className="card-soft rounded-xl p-3 mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-700">{s.activity_type}</p>
                      <p className="text-[10px] text-zinc-400">{s.fecha} · {formatTime(s.circuit_time_seconds)}s</p>
                      {obstacles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {obstacles.map((o) => (
                            <span key={o.id} className="text-[9px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
                              {o.obstacle?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {s.clean_run && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Clean</span>
                    )}
                  </div>
                );
              })}
            </FadeIn>
          </Section>
        )}

        {/* ── WEIGHT PROGRESS ── */}
        {vis.weight && weightHistory.length > 0 && (
          <Section>
            <FadeIn delay={600}>
              <SectionHeader icon={<TrendingDown className="w-5 h-5 text-blue-500" />} title="Progreso de Peso" />
              <div className="grid grid-cols-3 gap-3">
                <div className="card-soft rounded-xl p-3 text-center">
                  <p className="text-[9px] text-zinc-400 uppercase">Peso inicial</p>
                  <p className="text-lg font-black text-zinc-800">{weightInitial?.toFixed(1)} kg</p>
                </div>
                <div className="card-soft rounded-xl p-3 text-center">
                  <p className="text-[9px] text-zinc-400 uppercase">Peso actual</p>
                  <p className="text-lg font-black text-primary-600">{dog.peso_kg} kg</p>
                </div>
                <div className="card-soft rounded-xl p-3 text-center">
                  <p className="text-[9px] text-zinc-400 uppercase">Cambio</p>
                  <p className={`text-lg font-black ${weightDiff !== null && weightDiff > 0 ? "text-green-600" : weightDiff !== null && weightDiff < 0 ? "text-red-500" : "text-zinc-600"}`}>
                    {weightDiff !== null ? `${weightDiff > 0 ? "+" : ""}${weightDiff.toFixed(1)} kg` : "—"}
                  </p>
                </div>
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── MEDICAL / VACCINES ── */}
        {vis.medical && vaccines.length > 0 && (
          <Section>
            <FadeIn delay={650}>
              <SectionHeader icon={<Syringe className="w-5 h-5 text-blue-500" />} title="Vacunas" subtitle={`${vaccines.length} registradas`} />
              <div className="space-y-2">
                {vaccines.map((v, i) => (
                  <div key={i} className="card-soft rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-700">{v.vaccine_name}</p>
                      <p className="text-[10px] text-zinc-400">
                        Dosis {v.dose_number}
                        {v.date_administered && ` · ${new Date(v.date_administered).toLocaleDateString("es-ES")}`}
                      </p>
                    </div>
                    {v.next_due_date && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        new Date(v.next_due_date) < new Date() ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      }`}>
                        {new Date(v.next_due_date) < new Date() ? "Vencida" : "Al día"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── DIET ── */}
        {vis.diet && metabolicProfile && (
          <Section>
            <FadeIn delay={700}>
              <SectionHeader icon={<Utensils className="w-5 h-5 text-green-500" />} title="Alimentación" />
              <div className="card-soft rounded-xl p-4 space-y-2">
                <DietRow label="Tipo de dieta" value={DIET_LABELS[metabolicProfile.diet_type ?? ""] ?? metabolicProfile.diet_type ?? "—"} />
                <DietRow label="% Alimentación corporal" value={`${metabolicProfile.feeding_pct}%`} />
                {metabolicProfile.allergies.length > 0 && (
                  <DietRow label="Alergias" value={metabolicProfile.allergies.join(", ")} />
                )}
                {metabolicProfile.medical_conditions.length > 0 && (
                  <DietRow label="Condiciones" value={metabolicProfile.medical_conditions.join(", ")} />
                )}
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── CONTACT ── */}
        {vis.contact && publicProfile && (publicProfile.contact_phone || publicProfile.contact_email) && (
          <Section>
            <FadeIn delay={750}>
              <SectionHeader icon={<Phone className="w-5 h-5 text-green-500" />} title="Contacto" subtitle="Información del dueño" />
              <div className="space-y-2">
                {publicProfile.contact_phone && (
                  <a
                    href={`https://wa.me/${publicProfile.contact_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener"
                    className="card-soft rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase">WhatsApp</p>
                      <p className="text-sm font-bold text-zinc-700">{publicProfile.contact_phone}</p>
                    </div>
                  </a>
                )}
                {publicProfile.contact_email && (
                  <a
                    href={`mailto:${publicProfile.contact_email}`}
                    className="card-soft rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase">Email</p>
                      <p className="text-sm font-bold text-zinc-700">{publicProfile.contact_email}</p>
                    </div>
                  </a>
                )}
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── FALLBACK: no sections configured ── */}
        {!hasAnySection && !publicProfile?.bio && (
          <Section>
            <FadeIn delay={400}>
              <div className="rounded-2xl p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Heart className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-bold text-green-700 text-lg">{dog.nombre} está a salvo en casa</p>
                <p className="text-sm text-green-600 mt-1">
                  Este QR está en su collar por seguridad. Escanéalo si lo encuentras.
                </p>
              </div>
            </FadeIn>
          </Section>
        )}

        {/* ── SHARE & QR ── */}
        <Section>
          <FadeIn delay={800}>
            <div className="card-elevated rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Compartir perfil</p>
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
              >
                <MessageCircle className="w-5 h-5" />
                Compartir en WhatsApp
              </a>
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                      title: `${dog.nombre} - ${dog.raza}`,
                      text: `🐾 Perfil de ${dog.nombre}`,
                      url: shareUrl,
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all"
              >
                <Share2 className="w-5 h-5" />
                Compartir perfil
              </button>
            </div>
          </FadeIn>
        </Section>

        {/* ── QR ── */}
        <Section>
          <FadeIn delay={900}>
            <div className="card-elevated rounded-2xl p-6 text-center space-y-4">
              <div className="inline-flex p-3 bg-white rounded-2xl border-2 border-primary-100 shadow-lg">
                <QRCodeSVG value={shareUrl} size={160} level="M" fgColor="#4a47d4" />
              </div>
              <p className="text-xs text-zinc-400">Escanea este QR para ver el perfil completo</p>
              <p className="text-[10px] text-zinc-300 break-all font-mono">{shareUrl}</p>
            </div>
          </FadeIn>
        </Section>

        {/* ── FOOTER ── */}
        <FadeIn delay={1000}>
          <div className="text-center pt-2 pb-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary-50 border border-primary-100 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="text-sm font-bold text-primary-600">Blis Club</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3">
              El perfil canino más completo.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ── Mini components ── */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className={`card-soft rounded-xl p-3 border ${colors[color] ?? ""}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-xs font-bold leading-tight">{value}</p>
    </div>
  );
}

function DietRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
      <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
      <span className="text-xs font-bold text-zinc-700">{value}</span>
    </div>
  );
}
