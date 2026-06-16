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
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Equivalencia de Llantas</h1>
        <p className="text-xs text-zinc-400 mt-1">Verifica si un cambio de aros o llantas es seguro para tu vehículo.</p>
      </div>

      {/* Llanta actual */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900/5 flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">Llanta actual</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="number" min="100" max="500" value={original.ancho}
            onChange={(e) => setOriginal({ ...original, ancho: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          <span className="text-zinc-500 text-xs font-medium">/</span>
          <input type="number" min="20" max="100" value={original.perfil}
            onChange={(e) => setOriginal({ ...original, perfil: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          <span className="text-zinc-500 text-xs font-medium">R</span>
          <input type="number" min="12" max="30" value={original.rin}
            onChange={(e) => setOriginal({ ...original, rin: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </div>

        <p className="text-[10px] text-zinc-500 text-center">
          {original.ancho}/{original.perfil} R{original.rin}
        </p>
      </div>

      {/* Flecha */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-auto-600/15 flex items-center justify-center">
          <MoveDown className="w-4 h-4 text-auto-500" />
        </div>
      </div>

      {/* Llanta nueva */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-auto-600/15 flex items-center justify-center">
            <Ruler className="w-3.5 h-3.5 text-auto-500" />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">Llanta nueva</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="number" min="100" max="500" value={nuevo.ancho}
            onChange={(e) => setNuevo({ ...nuevo, ancho: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          <span className="text-zinc-500 text-xs font-medium">/</span>
          <input type="number" min="20" max="100" value={nuevo.perfil}
            onChange={(e) => setNuevo({ ...nuevo, perfil: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          <span className="text-zinc-500 text-xs font-medium">R</span>
          <input type="number" min="12" max="30" value={nuevo.rin}
            onChange={(e) => setNuevo({ ...nuevo, rin: e.target.value })}
            className="w-full px-2.5 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </div>

        <p className="text-[10px] text-zinc-500 text-center">
          {nuevo.ancho}/{nuevo.perfil} R{nuevo.rin}
        </p>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Estado de seguridad */}
          <div className={`rounded-2xl p-4 text-center border-2 ${
            resultados.estado === "seguro"
              ? "bg-auto-600/10 border-auto-600/20"
              : resultados.estado === "precaucion"
                ? "bg-auto-600/10 border-auto-600/20"
                : "bg-auto-900/20 border-auto-700/20"
          }`}>
            <resultados.estadoIcon className={`w-8 h-8 mx-auto mb-2 ${
              resultados.estado === "seguro" ? "text-auto-500" : resultados.estado === "precaucion" ? "text-auto-500" : "text-auto-400"
            }`} />
            <p className={`text-lg font-black ${
              resultados.estado === "seguro" ? "text-auto-500" : resultados.estado === "precaucion" ? "text-auto-500" : "text-auto-400"
            }`}>{resultados.estadoLabel}</p>
            <p className={`text-sm font-bold ${
              resultados.estado === "seguro" ? "text-auto-500" : resultados.estado === "precaucion" ? "text-auto-500" : "text-auto-400"
            } mt-1`}>
              Diferencia: {resultados.diferenciaPct > 0 ? "+" : ""}{resultados.diferenciaPct.toFixed(2)}%
            </p>
          </div>

          {/* Visualización de llantas */}
          <div className="card-auto-dark rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-300 mb-3 text-center">Comparación visual</h3>
            <div className="flex items-end justify-center gap-8">
              {/* Original */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="rounded-full border-4 border-white/15 bg-zinc-900/5 flex items-center justify-center"
                  style={{
                    width: `${resultados.original.diametroTotal * resultados.escalaVisual}px`,
                    height: `${resultados.original.diametroTotal * resultados.escalaVisual}px`,
                  }}
                />
                <span className="text-[10px] font-bold text-zinc-400">Actual</span>
                <span className="text-[9px] text-zinc-500">{resultados.original.diametroTotal.toFixed(1)} mm</span>
              </div>

              {/* Nueva */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="rounded-full border-4 border-auto-500 bg-auto-600/10 flex items-center justify-center"
                  style={{
                    width: `${resultados.nuevo.diametroTotal * resultados.escalaVisual}px`,
                    height: `${resultados.nuevo.diametroTotal * resultados.escalaVisual}px`,
                  }}
                />
                <span className="text-[10px] font-bold text-auto-500">Nueva</span>
                <span className="text-[9px] text-zinc-500">{resultados.nuevo.diametroTotal.toFixed(1)} mm</span>
              </div>
            </div>
          </div>

          {/* Datos técnicos */}
          <div className="grid grid-cols-2 gap-2">
            <div className="card-auto-dark rounded-xl p-3">
              <p className="text-[10px] text-zinc-500">Alto del flanco (Orig.)</p>
              <p className="text-sm font-bold text-zinc-200">{resultados.original.altoFlanco.toFixed(1)} mm</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3">
              <p className="text-[10px] text-zinc-500">Alto del flanco (Nuevo)</p>
              <p className="text-sm font-bold text-zinc-200">{resultados.nuevo.altoFlanco.toFixed(1)} mm</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3">
              <p className="text-[10px] text-zinc-500">Diámetro total (Orig.)</p>
              <p className="text-sm font-bold text-zinc-200">{resultados.original.diametroTotal.toFixed(1)} mm</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3">
              <p className="text-[10px] text-zinc-500">Diámetro total (Nuevo)</p>
              <p className="text-sm font-bold text-zinc-200">{resultados.nuevo.diametroTotal.toFixed(1)} mm</p>
            </div>
          </div>

          {/* Efectos */}
          <div className="card-auto-dark rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-auto-500" /> Efectos en el vehículo
            </h3>

            <div className="bg-zinc-900/5 rounded-xl p-3">
              <p className="text-xs text-zinc-400">
                Cuando circulas a <strong>100 km/h</strong> reales, el velocímetro marcará aproximadamente{" "}
                <strong className="text-auto-500">{resultados.velocidadIndicadaCuandoReal100.toFixed(1)} km/h</strong>
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {resultados.esMayor
                  ? "Llanta más grande → el velocímetro marca menos de lo real"
                  : "Llanta más pequeña → el velocímetro marca más de lo real"}
              </p>
            </div>

            <div className="bg-zinc-900/5 rounded-xl p-3">
              <p className="text-xs text-zinc-400">
                La altura de la carrocería cambia{" "}
                <strong className={resultados.cambioAltura > 0 ? "text-auto-500" : "text-auto-500"}>
                  {resultados.cambioAltura > 0 ? "+" : ""}{resultados.cambioAltura.toFixed(1)} mm
                </strong>
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {resultados.cambioAltura > 0
                  ? "Mayor altura al suelo, pero puede rozar el guardabarros al girar"
                  : "Menor altura al suelo, ojo con topes y baches"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Ingresa las medidas de ambas llantas</p>
          <p className="text-xs text-zinc-500 mt-1">Ej: 205/55 R16 vs 225/45 R17</p>
        </div>
      )}
    </div>
  );
}
