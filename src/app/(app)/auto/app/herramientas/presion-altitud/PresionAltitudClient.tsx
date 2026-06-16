"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Mountain, ArrowDown, ArrowUp, Gauge, Info, MapPin, Car, AlertTriangle } from "lucide-react";

interface Defaults {
  presionDelante: number | null;
  presionAtras: number | null;
}

const ciudadesPeru = [
  { nombre: "Lima (Costa)", altitud: 150 },
  { nombre: "Arequipa", altitud: 2335 },
  { nombre: "Cusco", altitud: 3399 },
  { nombre: "Puno", altitud: 3827 },
  { nombre: "Huancayo", altitud: 3271 },
  { nombre: "Cajamarca", altitud: 2750 },
  { nombre: "Cerro de Pasco", altitud: 4338 },
  { nombre: "Ayacucho", altitud: 2746 },
  { nombre: "Trujillo", altitud: 34 },
  { nombre: "Piura", altitud: 36 },
  { nombre: "Huaraz", altitud: 3052 },
  { nombre: "Ica", altitud: 406 },
  { nombre: "Juliaca", altitud: 3825 },
  { nombre: "Abancay", altitud: 2378 },
  { nombre: "Tacna", altitud: 562 },
];

export default function PresionAltitudClient({ defaults }: { defaults: Defaults }) {
  const [presionDelante, setPresionDelante] = useState(defaults.presionDelante?.toString() || "");
  const [presionAtras, setPresionAtras] = useState(defaults.presionAtras?.toString() || "");
  const [altitudOrigen, setAltitudOrigen] = useState("");
  const [altitudDestino, setAltitudDestino] = useState("");
  const [usarMismaPresion, setUsarMismaPresion] = useState(true);

  const usarCiudad = (altitud: number, target: "origen" | "destino") => {
    if (target === "origen") setAltitudOrigen(altitud.toString());
    else setAltitudDestino(altitud.toString());
  };

  const resultados = useMemo(() => {
    const pDel = parseFloat(presionDelante);
    const pAtr = parseFloat(presionAtras);
    const aOri = parseFloat(altitudOrigen);
    const aDes = parseFloat(altitudDestino);

    if (!pDel || !aOri || !aDes || aOri === aDes) return null;
    const pAtras = usarMismaPresion ? pDel : (!isNaN(pAtr) ? pAtr : pDel);

    const deltaAltitud = aDes - aOri; // positivo = ascenso, negativo = descenso
    const deltaPis = (deltaAltitud / 300) * 0.5;

    const nuevaDelante = pDel + deltaPis;
    const nuevaAtras = pAtras + deltaPis;

    const esAscenso = deltaAltitud > 0;
    const cambioAbsoluto = Math.abs(deltaPis);

    // Seguridad: no más de ±10 PSI
    const excesivo = cambioAbsoluto > 10;

    return {
      deltaAltitud,
      deltaPis,
      nuevaDelante: Math.max(0, nuevaDelante),
      nuevaAtras: Math.max(0, nuevaAtras),
      esAscenso,
      cambioAbsoluto,
      excesivo,
      presionAtras: pAtras,
    };
  }, [presionDelante, presionAtras, altitudOrigen, altitudDestino, usarMismaPresion]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Presión por Altitud</h1>
        <p className="text-xs text-zinc-400 mt-1">Ajusta la presión de los neumáticos al viajar entre la sierra y la costa.</p>
      </div>

      {/* Inputs */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        {/* Presión */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-600/15 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5 text-auto-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Presión en frío recomendada (PSI)</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-400">Delante</span>
              <div className="flex gap-1 mt-0.5">
                <input type="number" min="20" max="80" step="1" value={presionDelante}
                  onChange={(e) => setPresionDelante(e.target.value)}
                  placeholder="32"
                  className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
                {defaults.presionDelante && (
                  <button onClick={() => setPresionDelante(defaults.presionDelante!.toString())}
                    className="px-2 py-2 rounded-lg bg-zinc-900/5 text-[10px] font-bold text-zinc-400 hover:bg-auto-600/15 hover:text-auto-500">
                    {defaults.presionDelante}
                  </button>
                )}
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold text-zinc-400">Atrás</span>
              <div className="flex gap-1 mt-0.5">
                {usarMismaPresion ? (
                  <div className="flex-1 px-2.5 py-2 rounded-lg bg-zinc-900/5 text-sm font-medium text-zinc-500 flex items-center">
                    Igual que delante
                  </div>
                ) : (
                  <input type="number" min="20" max="80" step="1" value={presionAtras}
                    onChange={(e) => setPresionAtras(e.target.value)}
                    placeholder="32"
                    className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
                )}
                {defaults.presionAtras && (
                  <button onClick={() => { setUsarMismaPresion(false); setPresionAtras(defaults.presionAtras!.toString()); }}
                    className="px-2 py-2 rounded-lg bg-zinc-900/5 text-[10px] font-bold text-zinc-400 hover:bg-auto-600/15 hover:text-auto-500">
                    {defaults.presionAtras}
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Altitudes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mountain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Altitudes del viaje</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-400">Altitud de origen (msnm)</span>
              <input type="number" min="0" max="6000" step="10" value={altitudOrigen}
                onChange={(e) => setAltitudOrigen(e.target.value)}
                placeholder="Ej: 3400"
                className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-400">Altitud de destino (msnm)</span>
              <input type="number" min="0" max="6000" step="10" value={altitudDestino}
                onChange={(e) => setAltitudDestino(e.target.value)}
                placeholder="Ej: 150"
                className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            </label>
          </div>
        </div>

        {/* Referencias rápidas */}
        <div>
          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> Referencias rápidas (Perú)
          </span>
          <div className="flex flex-wrap gap-1">
            {ciudadesPeru.map((c) => (
              <button
                key={c.nombre}
                onClick={() => {
                  if (!altitudOrigen) usarCiudad(c.altitud, "origen");
                  else if (!altitudDestino) usarCiudad(c.altitud, "destino");
                  else usarCiudad(c.altitud, "destino");
                }}
                className="text-[9px] font-medium px-2 py-1 rounded-full bg-zinc-900/5 text-zinc-400 hover:bg-auto-600/15 hover:text-auto-500 transition-colors"
              >
                {c.nombre} ({c.altitud}m)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Dirección y ajuste */}
          <div className={`rounded-2xl p-4 text-center border-2 ${
            resultados.excesivo ? "bg-red-600/10 border-red-500/20" : "bg-blue-600/10 border-blue-500/20"
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-xs font-bold text-zinc-400">
                {Math.abs(resultados.deltaAltitud).toLocaleString("es-PE")} m
              </span>
              {resultados.esAscenso ? (
                <ArrowUp className="w-6 h-6 text-emerald-400" />
              ) : (
                <ArrowDown className="w-6 h-6 text-amber-400" />
              )}
              <span className="text-xs font-bold text-zinc-400">
                {resultados.esAscenso ? "Ascenso" : "Descenso"}
              </span>
            </div>

            <p className={`text-lg font-black ${
              resultados.excesivo ? "text-red-400" : "text-zinc-200"
            }`}>
              {resultados.deltaPis > 0 ? "+" : ""}{resultados.deltaPis.toFixed(1)} PSI
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {resultados.esAscenso
                ? "Suma 0.5 PSI por cada 300m de ascenso"
                : "Resta 0.5 PSI por cada 300m de descenso"}
            </p>
            {resultados.excesivo && (
              <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Ajuste mayor a 10 PSI. Verifica las altitudes.</p>
            )}
          </div>

          {/* Presiones ajustadas */}
          <div className="card-auto-dark rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5 mb-3">
              <Car className="w-3.5 h-3.5 text-auto-500" /> Presión ajustada
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500">Delante</p>
                <p className="text-2xl font-black text-auto-500">
                  {resultados.nuevaDelante.toFixed(1)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">PSI</p>
              </div>
              <div className="bg-zinc-900/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500">Atrás</p>
                <p className="text-2xl font-black text-auto-500">
                  {resultados.nuevaAtras.toFixed(1)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">PSI</p>
              </div>
            </div>
          </div>

          {/* Recomendación */}
          <div className="card-auto-dark rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-zinc-300">Recomendación</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  {resultados.esAscenso
                    ? "Al subir, la presión atmosférica disminuye y los neumáticos tienden a expandirse. Aumenta la presión para compensar y mantener la forma óptima del neumático."
                    : "Al bajar, la presión atmosférica aumenta y los neumáticos se comprimen. Reduce la presión para evitar sobreinflado que cause desgaste irregular y menor tracción."}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Ajusta la presión con los neumáticos en frío y usa un medidor calibrado.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Completa los campos para ver el ajuste</p>
          <p className="text-xs text-zinc-500 mt-1">Presión en frío y altitudes de origen y destino</p>
        </div>
      )}
    </div>
  );
}
