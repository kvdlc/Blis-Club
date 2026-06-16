"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Car, Gauge, Ruler, AlertTriangle, CheckCircle2, MoveUp, MoveDown } from "lucide-react";

interface TireData {
  ancho: number;
  perfil: number;
  rin: number;
  altoFlanco: number;
  diametroTotal: number;
  circunferencia: number;
}

export default function EquivalenciaClient() {
  const [original, setOriginal] = useState({ ancho: "205", perfil: "55", rin: "16" });
  const [nuevo, setNuevo] = useState({ ancho: "225", perfil: "45", rin: "17" });

  const resultados = useMemo(() => {
    const oAncho = parseFloat(original.ancho);
    const oPerfil = parseFloat(original.perfil);
    const oRin = parseFloat(original.rin);
    const nAncho = parseFloat(nuevo.ancho);
    const nPerfil = parseFloat(nuevo.perfil);
    const nRin = parseFloat(nuevo.rin);

    if (!oAncho || !oPerfil || !oRin || !nAncho || !nPerfil || !nRin) return null;
    if (oAncho <= 0 || oPerfil <= 0 || oRin <= 0 || nAncho <= 0 || nPerfil <= 0 || nRin <= 0) return null;

    const calc = (ancho: number, perfil: number, rin: number): TireData => {
      const altoFlanco = ancho * (perfil / 100);
      const diametroTotal = (rin * 25.4) + (altoFlanco * 2);
      const circunferencia = diametroTotal * Math.PI;
      return { ancho, perfil, rin, altoFlanco, diametroTotal, circunferencia };
    };

    const o = calc(oAncho, oPerfil, oRin);
    const n = calc(nAncho, nPerfil, nRin);

    const diferenciaPct = ((n.diametroTotal - o.diametroTotal) / o.diametroTotal) * 100;
    const diferenciaMm = n.diametroTotal - o.diametroTotal;
    const esMayor = n.diametroTotal > o.diametroTotal;

    // Efecto en velocímetro: si la llanta nueva es más grande, el velocímetro marca menos de lo real
    const velocidadIndicadaCuandoReal100 = 100 * (o.diametroTotal / n.diametroTotal);

    // Cambio en altura de carrocería (ground clearance)
    const cambioAltura = diferenciaMm / 2;

    // Estado de seguridad
    const absPct = Math.abs(diferenciaPct);
    const estado = absPct <= 3 ? "seguro" : absPct <= 5 ? "precaucion" : "peligro";
    const estadoLabel = estado === "seguro" ? "Cambio seguro (≤3%)" : estado === "precaucion" ? "Precaución (3-5%)" : "No recomendado (>5%)";
    const estadoIcon = estado === "seguro" ? CheckCircle2 : AlertTriangle;

    // Visualización proporcional de las llantas
    const maxDiam = Math.max(o.diametroTotal, n.diametroTotal);
    const escalaVisual = 200 / maxDiam; // escala para que el más grande ocupe ~200px

    return {
      original: o,
      nuevo: n,
      diferenciaPct,
      diferenciaMm,
      esMayor,
      velocidadIndicadaCuandoReal100,
      cambioAltura,
      estado,
      estadoLabel,
      estadoIcon,
      escalaVisual,
      absPct,
    };
  }, [original, nuevo]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-600 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Equivalencia de Llantas</h1>
        <p className="text-xs text-zinc-500 mt-1">Verifica si un cambio de aros o llantas es seguro para tu vehículo.</p>
      </div>

      {/* Llanta actual */}
      <div className="card-soft rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-700">Llanta actual</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="number" min="100" max="500" value={original.ancho}
            onChange={(e) => setOriginal({ ...original, ancho: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
          <span className="text-zinc-400 text-xs font-medium">/</span>
          <input type="number" min="20" max="100" value={original.perfil}
            onChange={(e) => setOriginal({ ...original, perfil: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
          <span className="text-zinc-400 text-xs font-medium">R</span>
          <input type="number" min="12" max="30" value={original.rin}
            onChange={(e) => setOriginal({ ...original, rin: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
        </div>

        <p className="text-[10px] text-zinc-400 text-center">
          {original.ancho}/{original.perfil} R{original.rin}
        </p>
      </div>

      {/* Flecha */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-auto-100 flex items-center justify-center">
          <MoveDown className="w-4 h-4 text-auto-500" />
        </div>
      </div>

      {/* Llanta nueva */}
      <div className="card-soft rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-auto-100 flex items-center justify-center">
            <Ruler className="w-3.5 h-3.5 text-auto-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-700">Llanta nueva</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="number" min="100" max="500" value={nuevo.ancho}
            onChange={(e) => setNuevo({ ...nuevo, ancho: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
          <span className="text-zinc-400 text-xs font-medium">/</span>
          <input type="number" min="20" max="100" value={nuevo.perfil}
            onChange={(e) => setNuevo({ ...nuevo, perfil: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
          <span className="text-zinc-400 text-xs font-medium">R</span>
          <input type="number" min="12" max="30" value={nuevo.rin}
            onChange={(e) => setNuevo({ ...nuevo, rin: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-200" />
        </div>

        <p className="text-[10px] text-zinc-400 text-center">
          {nuevo.ancho}/{nuevo.perfil} R{nuevo.rin}
        </p>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Estado de seguridad */}
          <div className={`rounded-2xl p-4 text-center border-2 ${
            resultados.estado === "seguro"
              ? "bg-emerald-50 border-emerald-200"
              : resultados.estado === "precaucion"
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
          }`}>
            <resultados.estadoIcon className={`w-8 h-8 mx-auto mb-2 ${
              resultados.estado === "seguro" ? "text-emerald-600" : resultados.estado === "precaucion" ? "text-amber-600" : "text-red-600"
            }`} />
            <p className={`text-lg font-black ${
              resultados.estado === "seguro" ? "text-emerald-700" : resultados.estado === "precaucion" ? "text-amber-700" : "text-red-700"
            }`}>{resultados.estadoLabel}</p>
            <p className={`text-sm font-bold ${
              resultados.estado === "seguro" ? "text-emerald-600" : resultados.estado === "precaucion" ? "text-amber-600" : "text-red-600"
            } mt-1`}>
              Diferencia: {resultados.diferenciaPct > 0 ? "+" : ""}{resultados.diferenciaPct.toFixed(2)}%
            </p>
          </div>

          {/* Visualización de llantas */}
          <div className="card-soft rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-700 mb-3 text-center">Comparación visual</h3>
            <div className="flex items-end justify-center gap-8">
              {/* Original */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="rounded-full border-4 border-zinc-300 bg-zinc-50 flex items-center justify-center"
                  style={{
                    width: `${resultados.original.diametroTotal * resultados.escalaVisual}px`,
                    height: `${resultados.original.diametroTotal * resultados.escalaVisual}px`,
                  }}
                />
                <span className="text-[10px] font-bold text-zinc-500">Actual</span>
                <span className="text-[9px] text-zinc-400">{resultados.original.diametroTotal.toFixed(1)} mm</span>
              </div>

              {/* Nueva */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="rounded-full border-4 border-auto-400 bg-auto-50 flex items-center justify-center"
                  style={{
                    width: `${resultados.nuevo.diametroTotal * resultados.escalaVisual}px`,
                    height: `${resultados.nuevo.diametroTotal * resultados.escalaVisual}px`,
                  }}
                />
                <span className="text-[10px] font-bold text-auto-600">Nueva</span>
                <span className="text-[9px] text-zinc-400">{resultados.nuevo.diametroTotal.toFixed(1)} mm</span>
              </div>
            </div>
          </div>

          {/* Datos técnicos */}
          <div className="grid grid-cols-2 gap-2">
            <div className="card-soft rounded-xl p-3">
              <p className="text-[10px] text-zinc-400">Alto del flanco (Orig.)</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.original.altoFlanco.toFixed(1)} mm</p>
            </div>
            <div className="card-soft rounded-xl p-3">
              <p className="text-[10px] text-zinc-400">Alto del flanco (Nuevo)</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.nuevo.altoFlanco.toFixed(1)} mm</p>
            </div>
            <div className="card-soft rounded-xl p-3">
              <p className="text-[10px] text-zinc-400">Diámetro total (Orig.)</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.original.diametroTotal.toFixed(1)} mm</p>
            </div>
            <div className="card-soft rounded-xl p-3">
              <p className="text-[10px] text-zinc-400">Diámetro total (Nuevo)</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.nuevo.diametroTotal.toFixed(1)} mm</p>
            </div>
          </div>

          {/* Efectos */}
          <div className="card-soft rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold text-zinc-700 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-auto-500" /> Efectos en el vehículo
            </h3>

            <div className="bg-zinc-50 rounded-xl p-3">
              <p className="text-xs text-zinc-600">
                Cuando circulas a <strong>100 km/h</strong> reales, el velocímetro marcará aproximadamente{" "}
                <strong className="text-auto-600">{resultados.velocidadIndicadaCuandoReal100.toFixed(1)} km/h</strong>
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                {resultados.esMayor
                  ? "Llanta más grande → el velocímetro marca menos de lo real"
                  : "Llanta más pequeña → el velocímetro marca más de lo real"}
              </p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-3">
              <p className="text-xs text-zinc-600">
                La altura de la carrocería cambia{" "}
                <strong className={resultados.cambioAltura > 0 ? "text-auto-600" : "text-amber-600"}>
                  {resultados.cambioAltura > 0 ? "+" : ""}{resultados.cambioAltura.toFixed(1)} mm
                </strong>
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                {resultados.cambioAltura > 0
                  ? "Mayor altura al suelo, pero puede rozar el guardabarros al girar"
                  : "Menor altura al suelo, ojo con topes y baches"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-soft rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-400">Ingresa las medidas de ambas llantas</p>
          <p className="text-xs text-zinc-300 mt-1">Ej: 205/55 R16 vs 225/45 R17</p>
        </div>
      )}

      {/* Fórmulas */}
      <details className="card-soft rounded-2xl p-4">
        <summary className="text-xs font-bold text-zinc-500 cursor-pointer">Ver fórmulas utilizadas</summary>
        <div className="mt-3 space-y-2 text-xs text-zinc-600 bg-zinc-50 rounded-xl p-3">
          <p><code className="text-auto-600 font-bold">Alto del Flanco</code> = Ancho (mm) × (Perfil / 100)</p>
          <p><code className="text-auto-600 font-bold">Diámetro Total</code> = (Rin × 25.4) + (Alto del Flanco × 2)</p>
          <p><code className="text-auto-600 font-bold">Diferencia %</code> = (Diámetro Nuevo − Diámetro Original) / Diámetro Original × 100</p>
          <p className="text-zinc-400 mt-2">Tolerancia máxima recomendada: ±3%. Entre 3-5% requiere revisión. Más de 5% no es seguro.</p>
        </div>
      </details>
    </div>
  );
}
