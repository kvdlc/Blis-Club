"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Droplets, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function ConsumoAceiteClient() {
  const [mlRellenados, setMlRellenados] = useState("");
  const [kmRecorridos, setKmRecorridos] = useState("");

  const resultados = useMemo(() => {
    const ml = parseFloat(mlRellenados);
    const km = parseFloat(kmRecorridos);
    if (!ml || !km || ml <= 0 || km <= 0) return null;

    // Consumo cada 1000 km
    const consumo1000 = (ml / km) * 1000;
    const consumo10000 = (ml / km) * 10000; // Litros cada 10k

    // Diagnóstico
    let diagnostico: { nivel: string; color: string; icon: typeof CheckCircle2; descripcion: string; recomendacion: string };
    if (consumo1000 < 100) {
      diagnostico = {
        nivel: "Excelente",
        color: "emerald",
        icon: CheckCircle2,
        descripcion: "Motor en muy buen estado. Desgaste mínimo.",
        recomendacion: "Continúa con los cambios de aceite según el manual del fabricante.",
      };
    } else if (consumo1000 < 300) {
      diagnostico = {
        nivel: "Normal",
        color: "blue",
        icon: Info,
        descripcion: "Consumo dentro del rango esperado para un motor con kilometraje medio.",
        recomendacion: "Revisa el nivel de aceite cada 500 km y completa si es necesario.",
      };
    } else if (consumo1000 < 500) {
      diagnostico = {
        nivel: "Atención",
        color: "amber",
        icon: AlertTriangle,
        descripcion: "Desgaste significativo. Posible fuga o quema de aceite.",
        recomendacion: "Inspecciona el motor por fugas visibles y verifica el humo del escape. Considera usar aceite de mayor viscosidad.",
      };
    } else {
      diagnostico = {
        nivel: "Crítico",
        color: "red",
        icon: AlertTriangle,
        descripcion: "Consumo excesivo. El motor requiere atención profesional.",
        recomendacion: "Lleva el auto a un mecánico inmediatamente. Posible daño en anillos, sellos de válvulas o turbo.",
      };
    }

    // Para medidor visual (0-600 ml/1000km es el rango del arco)
    const gaugeAngle = Math.min(consumo1000 / 600, 1) * 180; // 0-180 grados

    return {
      consumo1000,
      consumo10000,
      diagnostico,
      gaugeAngle,
    };
  }, [mlRellenados, kmRecorridos]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-600 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Consumo de Aceite</h1>
        <p className="text-xs text-zinc-500 mt-1">Mide el desgaste interno del motor cuantificando el consumo de aceite.</p>
      </div>

      {/* Inputs */}
      <div className="card-soft rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-auto-100 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5 text-auto-600" />
          </div>
          <h3 className="text-xs font-bold text-zinc-700">Datos de la última recarga</h3>
        </div>

        <label className="block">
          <span className="text-[10px] font-bold text-zinc-500">Aceite rellenado (ml)</span>
          <div className="relative mt-0.5">
            <input
              type="number" min="1" step="10"
              value={mlRellenados} onChange={(e) => setMlRellenados(e.target.value)}
              placeholder="Ej: 500"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">ml</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Cuánto aceite agregaste desde el último cambio</p>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold text-zinc-500">Kilómetros recorridos desde el último cambio</span>
          <div className="relative mt-0.5">
            <input
              type="number" min="1" step="100"
              value={kmRecorridos} onChange={(e) => setKmRecorridos(e.target.value)}
              placeholder="Ej: 5000"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">km</span>
          </div>
        </label>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Medidor visual */}
          <div className="card-soft rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-700 text-center mb-3">Medidor de desgaste</h3>

            <div className="flex justify-center">
              <div className="relative w-48 h-28 overflow-hidden">
                {/* Arco de fondo */}
                <svg className="w-full h-full" viewBox="0 0 180 90">
                  {/* Fondo */}
                  <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                  {/* Gradiente de colores (segmentos) */}
                  <path d="M 10 90 A 80 80 0 0 1 60 30" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.7" />
                  <path d="M 60 30 A 80 80 0 0 1 100 15" fill="none" stroke="#3b82f6" strokeWidth="14" strokeLinecap="butt" opacity="0.7" />
                  <path d="M 100 15 A 80 80 0 0 1 145 30" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="butt" opacity="0.7" />
                  <path d="M 145 30 A 80 80 0 0 1 170 90" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="butt" opacity="0.7" />
                  {/* Aguja */}
                  <line
                    x1="90" y1="85" x2="90" y2="15"
                    stroke="#1e293b" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: `rotate(${resultados.gaugeAngle - 90}deg)`, transformOrigin: "90px 85px" }}
                  />
                  {/* Pivote */}
                  <circle cx="90" cy="85" r="5" fill="#1e293b" />
                </svg>

                {/* Valor central */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-2xl font-black text-zinc-800">{resultados.consumo1000.toFixed(0)}</p>
                  <p className="text-[10px] text-zinc-400">ml / 1000 km</p>
                </div>
              </div>
            </div>

            {/* Marcadores */}
            <div className="flex justify-between text-[8px] text-zinc-400 px-2 mt-1">
              <span>0</span>
              <span>100</span>
              <span>300</span>
              <span>500</span>
              <span>600+</span>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className={`rounded-2xl p-4 border-2 ${
            resultados.diagnostico.color === "emerald" ? "bg-emerald-50 border-emerald-200" :
            resultados.diagnostico.color === "blue" ? "bg-blue-50 border-blue-200" :
            resultados.diagnostico.color === "amber" ? "bg-amber-50 border-amber-200" :
            "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <resultados.diagnostico.icon className={`w-8 h-8 shrink-0 ${
                resultados.diagnostico.color === "emerald" ? "text-emerald-600" :
                resultados.diagnostico.color === "blue" ? "text-blue-600" :
                resultados.diagnostico.color === "amber" ? "text-amber-600" :
                "text-red-600"
              }`} />
              <div>
                <p className={`text-lg font-black ${
                  resultados.diagnostico.color === "emerald" ? "text-emerald-700" :
                  resultados.diagnostico.color === "blue" ? "text-blue-700" :
                  resultados.diagnostico.color === "amber" ? "text-amber-700" :
                  "text-red-700"
                }`}>
                  {resultados.diagnostico.nivel}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">{resultados.diagnostico.descripcion}</p>
              </div>
            </div>
            <div className="mt-3 bg-white/60 rounded-xl p-3">
              <p className="text-xs font-bold text-zinc-700">Qué hacer</p>
              <p className="text-xs text-zinc-600 mt-0.5">{resultados.diagnostico.recomendacion}</p>
            </div>
          </div>

          {/* Datos numéricos */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400">Rellenado</p>
              <p className="text-sm font-bold text-zinc-800">{parseFloat(mlRellenados).toLocaleString("es-PE")} ml</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400">Recorrido</p>
              <p className="text-sm font-bold text-zinc-800">{parseFloat(kmRecorridos).toLocaleString("es-PE")} km</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400">Cada 10k km</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.consumo10000.toFixed(1)} L</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-soft rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-400">Completa los campos para ver el diagnóstico</p>
          <p className="text-xs text-zinc-300 mt-1">Mililitros rellenados y kilómetros recorridos desde el último cambio</p>
        </div>
      )}

      {/* Fórmula */}
      <details className="card-soft rounded-2xl p-4">
        <summary className="text-xs font-bold text-zinc-500 cursor-pointer">Ver fórmula e interpretación</summary>
        <div className="mt-3 space-y-2 text-xs text-zinc-600 bg-zinc-50 rounded-xl p-3">
          <p><code className="text-auto-600 font-bold">Consumo cada 1000 km</code> = (ml Rellenados / km Recorridos) × 1000</p>
          <div className="mt-3 space-y-1">
            <p className="font-bold text-zinc-700">Interpretación:</p>
            <p><span className="text-emerald-600 font-bold">≤100 ml/1000km</span> → Excelente. Motor en buen estado.</p>
            <p><span className="text-blue-600 font-bold">100-300 ml/1000km</span> → Normal. Desgaste moderado.</p>
            <p><span className="text-amber-600 font-bold">300-500 ml/1000km</span> → Atención. Revisar fugas y humo.</p>
            <p><span className="text-red-600 font-bold">&gt;500 ml/1000km</span> → Crítico. Requiere revisión mecánica.</p>
          </div>
        </div>
      </details>
    </div>
  );
}
