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
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Consumo de Aceite</h1>
        <p className="text-xs text-zinc-400 mt-1">Mide el desgaste interno del motor cuantificando el consumo de aceite.</p>
      </div>

      {/* Inputs */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-auto-600/15 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5 text-auto-500" />
          </div>
          <h3 className="text-xs font-bold text-zinc-300">Datos de la última recarga</h3>
        </div>

        <label className="block">
          <span className="text-[10px] font-bold text-zinc-400">Aceite rellenado (ml)</span>
          <div className="relative mt-0.5">
            <input
              type="number" min="1" step="10"
              value={mlRellenados} onChange={(e) => setMlRellenados(e.target.value)}
              placeholder="Ej: 500"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">ml</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Cuánto aceite agregaste desde el último cambio</p>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold text-zinc-400">Kilómetros recorridos desde el último cambio</span>
          <div className="relative mt-0.5">
            <input
              type="number" min="1" step="100"
              value={kmRecorridos} onChange={(e) => setKmRecorridos(e.target.value)}
              placeholder="Ej: 5000"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">km</span>
          </div>
        </label>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Medidor visual */}
          <div className="card-auto-dark rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-300 text-center mb-3">Medidor de desgaste</h3>

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
                  <path d="M 145 30 A 80 80 0 0 1 170 90" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.7" />
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
                  <p className="text-2xl font-black text-zinc-200">{resultados.consumo1000.toFixed(0)}</p>
                  <p className="text-[10px] text-zinc-500">ml / 1000 km</p>
                </div>
              </div>
            </div>

            {/* Marcadores */}
            <div className="flex justify-between text-[8px] text-zinc-500 px-2 mt-1">
              <span>0</span>
              <span>100</span>
              <span>300</span>
              <span>500</span>
              <span>600+</span>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className={`rounded-2xl p-4 border-2 ${
            resultados.diagnostico.color === "emerald" ? "bg-auto-600/10 border-auto-600/20" :
            resultados.diagnostico.color === "blue" ? "bg-auto-600/10 border-auto-600/20" :
            resultados.diagnostico.color === "amber" ? "bg-auto-600/10 border-auto-600/20" :
            "bg-auto-900/20 border-auto-700/20"
          }`}>
            <div className="flex items-center gap-3">
              <resultados.diagnostico.icon className={`w-8 h-8 shrink-0 ${
                resultados.diagnostico.color === "emerald" ? "text-auto-500" :
                resultados.diagnostico.color === "blue" ? "text-auto-500" :
                resultados.diagnostico.color === "amber" ? "text-auto-500" :
                "text-auto-400"
              }`} />
              <div>
                <p className={`text-lg font-black ${
                  resultados.diagnostico.color === "emerald" ? "text-auto-500" :
                  resultados.diagnostico.color === "blue" ? "text-auto-500" :
                  resultados.diagnostico.color === "amber" ? "text-auto-500" :
                  "text-auto-400"
                }`}>
                  {resultados.diagnostico.nivel}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{resultados.diagnostico.descripcion}</p>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-3">
              <p className="text-xs font-bold text-zinc-300">Qué hacer</p>
              <p className="text-xs text-zinc-400 mt-0.5">{resultados.diagnostico.recomendacion}</p>
            </div>
          </div>

          {/* Datos numéricos */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Rellenado</p>
              <p className="text-sm font-bold text-zinc-200">{parseFloat(mlRellenados).toLocaleString("es-PE")} ml</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Recorrido</p>
              <p className="text-sm font-bold text-zinc-200">{parseFloat(kmRecorridos).toLocaleString("es-PE")} km</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Cada 10k km</p>
              <p className="text-sm font-bold text-zinc-200">{resultados.consumo10000.toFixed(1)} L</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Completa los campos para ver el diagnóstico</p>
          <p className="text-xs text-zinc-500 mt-1">Mililitros rellenados y kilómetros recorridos desde el último cambio</p>
        </div>
      )}
    </div>
  );
}
