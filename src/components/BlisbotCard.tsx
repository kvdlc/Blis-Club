"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, ChevronDown, Sparkles } from "lucide-react";
import { useMoney } from "@/lib/money";
import { computeInsights, saludoPorHora, nivelGeneral } from "@/lib/insights";
import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";

interface Props {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  documents: VehicleDocument[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
  specs: VehicleSpecs | null;
}

const documentLabels: Record<string, string> = {
  soat: "SOAT",
  revision_tecnica: "revisión técnica",
  poliza_seguro: "póliza de seguro",
  matricula: "matrícula",
  licencia_conducir: "licencia",
};

export default function BlisbotCard({ vehicle, fuelLogs, documents, maintenances, upgrades, specs }: Props) {
  const router = useRouter();
  const { money } = useMoney();
  const ins = useMemo(
    () => computeInsights({ vehicle, fuelLogs, documents, maintenances, upgrades, specs }),
    [vehicle, fuelLogs, documents, maintenances, upgrades, specs]
  );

  const [abierto, setAbierto] = useState(false);
  const [animar, setAnimar] = useState(false); // primera vez del día

  // ¿Es la primera visita del día? → activar animación de entrada
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const visto = localStorage.getItem("blis_insight_fecha");
      if (visto !== today) setAnimar(true);
    } catch { /* ignore */ }
  }, []);

  // Cuando se ve el resumen completo por 1ª vez del día, marcar visto
  useEffect(() => {
    if (abierto) {
      try { localStorage.setItem("blis_insight_fecha", new Date().toISOString().slice(0, 10)); } catch {}
    }
  }, [abierto]);

  const nivel = nivelGeneral(ins.alertas);
  const numAvisos = ins.alertas.length;

  // Líneas: alertas primero, luego resumen natural
  const lineas: { emoji: string; texto: string; href?: string; alerta?: boolean }[] = useMemo(() => {
    const L: { emoji: string; texto: string; href?: string; alerta?: boolean }[] = [];

    for (const a of ins.alertas) {
      L.push({ emoji: a.emoji, texto: a.frase, href: a.href, alerta: true });
    }

    if (ins.alertas.length === 0) {
      L.push({ emoji: "🚗", texto: `Tu ${vehicle.marca} ${vehicle.modelo} está al día.` });
    }

    const ult = fuelLogs[0];
    if (ins.diasSinCargar != null && ult) {
      const d = ins.diasSinCargar;
      L.push({ emoji: "⛽", texto: `Hace ${d} día${d !== 1 ? "s" : ""} llenaste el tanque (${money(ult.precio_por_galon)}/gal).`, href: "/auto/app/bitacora" });
    }

    if (ins.diffMesPct != null && ins.cargaMesActual > 0) {
      const dir = ins.diffMesPct >= 0 ? "subió" : "bajó";
      L.push({ emoji: "💸", texto: `Llevas ${money(ins.cargaMesActual)} en combustible este mes, ${dir} ${Math.abs(ins.diffMesPct)}% vs el pasado.`, href: "/auto/app/bitacora" });
    } else if (ins.cargaMesActual > 0) {
      L.push({ emoji: "💰", texto: `Llevas ${money(ins.cargaMesActual)} en combustible este mes.`, href: "/auto/app/bitacora" });
    }

    if (ins.rendimientoKmGal != null) {
      L.push({ emoji: "📈", texto: `Rendimiento real: ${ins.rendimientoKmGal} km/gal${ins.autonomiaKm ? ` → rinde ~${ins.autonomiaKm} km por tanque` : ""}.`, href: "/auto/app/herramientas/rendimiento" });
    }

    if (ins.costoPorKm != null && ins.costoPorKm > 0) {
      L.push({ emoji: "🪙", texto: `≈ ${money(ins.costoPorKm, 2)} por kilómetro en combustible.`, href: "/auto/app/herramientas/costo-km-real" });
    }

    if (ins.kmProximoServicio != null && ins.kmProximoServicio > 0) {
      L.push({ emoji: "🔧", texto: `Faltan ${ins.kmProximoServicio.toLocaleString("es-PE")} km para tu próximo servicio.`, href: "/auto/app/bitacora" });
    }

    for (const doc of ins.docsQueVencen) {
      const dias = Math.ceil((new Date(doc.fecha_vencimiento + "T12:00:00").getTime() - Date.now()) / (1000 * 3600 * 24));
      const label = documentLabels[doc.tipo] || doc.tipo;
      if (dias <= 30) L.push({ emoji: "🛡️", texto: `Tu ${label} vence${dias < 0 ? ` (hace ${Math.abs(dias)} días)` : ` en ${dias} día${dias !== 1 ? "s" : ""}`}.`, href: "/auto/app/guantera" });
    }

    if (ins.proyeccionAnual > 0) {
      L.push({ emoji: "📊", texto: `Al ritmo actual gastarías ≈ ${money(ins.proyeccionAnual)} al año.`, href: "/auto/app/bitacora" });
    }

    if (ins.inversionMejoras > 0) {
      L.push({ emoji: "✨", texto: `Has invertido ${money(ins.inversionMejoras)} en mejoras.`, href: "/auto/app/bitacora" });
    }

    if (L.length === 0) {
      L.push({ emoji: "🌱", texto: "Registra una carga de combustible para que Blisbot analice tu auto.", href: "/auto/app/bitacora" });
    }

    return L;
  }, [ins, money, fuelLogs, vehicle]);

  const visibles = abierto ? lineas : lineas.slice(0, 3);
  const puntoColor = nivel === "alta" ? "bg-red-500" : nivel === "media" ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${
      nivel === "alta"
        ? "bg-red-950/20 border-red-500/25"
        : nivel === "media"
          ? "bg-amber-950/20 border-amber-500/25"
          : "bg-white/[0.06] border-white/10"
    }`}>
      {/* Header */}
      <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center gap-3 text-left">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-auto-600 to-auto-900 flex items-center justify-center shadow-lg shadow-auto-600/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${puntoColor} border-2 border-zinc-950 ${nivel !== "ok" ? "animate-pulse" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
            Blisbot
            {nivel === "ok" && <Sparkles className="w-3 h-3 text-auto-400" />}
            {nivel !== "ok" && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${nivel === "alta" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                {numAvisos} aviso{numAvisos !== 1 ? "s" : ""}
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {saludoPorHora()}, soy tu asistente del auto. {nivel !== "ok" ? "Toca para ver tus avisos." : "Toca para tu resumen."}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {/* Líneas */}
      <div className="mt-3 space-y-1.5">
        {visibles.map((item, i) => (
          <button
            key={i}
            onClick={() => item.href && router.push(item.href)}
            disabled={!item.href}
            className={`w-full flex items-start gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
              item.alerta ? "bg-red-500/10 border border-red-500/20" : "bg-white/[0.04] border border-white/5"
            } ${item.href ? "hover:bg-white/[0.08] cursor-pointer" : "cursor-default"} animate-fade-in-up ${animar ? `stagger-${Math.min(i + 1, 5)}` : ""}`}
            style={!animar ? undefined : { animationDelay: `${Math.min(i, 5) * 0.08}s` }}
          >
            <span className="shrink-0">{item.emoji}</span>
            <span className={`text-xs leading-relaxed ${item.alerta ? "text-red-200" : "text-zinc-300"}`}>{item.texto}</span>
          </button>
        ))}

        {!abierto && lineas.length > 3 && (
          <button onClick={() => setAbierto(true)} className="w-full text-left px-3 py-1 text-[10px] font-bold text-auto-400 hover:text-auto-300">
            Ver {lineas.length - 3} más…
          </button>
        )}
      </div>
    </div>
  );
}
