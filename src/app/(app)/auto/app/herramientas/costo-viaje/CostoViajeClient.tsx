"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Users, Fuel, Coins, Route } from "lucide-react";

interface Defaults {
  rendimientoPromedio: number | null;
  capacidadTanque: number | null;
  ultimoPrecio: number | null;
}

interface Peaje {
  id: number;
  nombre: string;
  costo: number;
}

export default function CostoViajeClient({ defaults }: { defaults: Defaults }) {
  const [distancia, setDistancia] = useState("");
  const [rendimiento, setRendimiento] = useState(defaults.rendimientoPromedio?.toString() || "");
  const [precioGalon, setPrecioGalon] = useState(defaults.ultimoPrecio?.toString() || "");
  const [peajes, setPeajes] = useState<Peaje[]>([]);
  const [nuevoPeaje, setNuevoPeaje] = useState({ nombre: "", costo: "" });
  const [pasajeros, setPasajeros] = useState("1");
  const [nextId, setNextId] = useState(1);

  const usarRendimientoPromedio = () => {
    if (defaults.rendimientoPromedio) setRendimiento(defaults.rendimientoPromedio.toString());
  };
  const usarUltimoPrecio = () => {
    if (defaults.ultimoPrecio) setPrecioGalon(defaults.ultimoPrecio.toString());
  };

  const agregarPeaje = () => {
    const costo = parseFloat(nuevoPeaje.costo);
    if (!costo || costo <= 0) return;
    setPeajes([...peajes, { id: nextId, nombre: nuevoPeaje.nombre || `Peaje ${peajes.length + 1}`, costo }]);
    setNuevoPeaje({ nombre: "", costo: "" });
    setNextId(nextId + 1);
  };

  const eliminarPeaje = (id: number) => {
    setPeajes(peajes.filter((p) => p.id !== id));
  };

  const resultados = useMemo(() => {
    const d = parseFloat(distancia);
    const r = parseFloat(rendimiento);
    const p = parseFloat(precioGalon);
    const numPasajeros = parseInt(pasajeros) || 1;

    if (!d || !r || !p || d <= 0 || r <= 0 || p <= 0) return null;

    const galonesNecesarios = d / r;
    const costoCombustible = galonesNecesarios * p;
    const totalPeajes = peajes.reduce((sum, peaje) => sum + peaje.costo, 0);
    const costoTotal = costoCombustible + totalPeajes;
    const costoPorPersona = costoTotal / numPasajeros;

    // Para gráfico de barras
    const maxVal = Math.max(costoCombustible, totalPeajes, 1);
    const combustiblePct = (costoCombustible / costoTotal) * 100;
    const peajesPct = (totalPeajes / costoTotal) * 100;

    return {
      galonesNecesarios,
      costoCombustible,
      totalPeajes,
      costoTotal,
      costoPorPersona,
      combustiblePct,
      peajesPct,
      maxVal,
      barraCombustible: (costoCombustible / maxVal) * 100,
      barraPeajes: (totalPeajes / maxVal) * 100,
    };
  }, [distancia, rendimiento, precioGalon, peajes, pasajeros]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Costo de Viaje</h1>
        <p className="text-xs text-zinc-500 mt-1">Estima el presupuesto necesario para una ruta específica.</p>
      </div>

      {/* Inputs */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-3">
        {/* Distancia */}
        <label className="block">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-auto-500" /> Distancia (km)
          </span>
          <div className="relative mt-1">
            <input
              type="number" min="1" step="1"
              value={distancia}
              onChange={(e) => setDistancia(e.target.value)}
              placeholder="Ej: 350"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">km</span>
          </div>
        </label>

        {/* Rendimiento */}
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-auto-500" /> Rendimiento (km/galón)
            </span>
            {defaults.rendimientoPromedio && (
              <button onClick={usarRendimientoPromedio} className="text-[10px] font-bold text-auto-500 bg-auto-600/10 px-2 py-0.5 rounded-full hover:bg-auto-600/15 transition-colors">
                Usar {defaults.rendimientoPromedio} km/gal
              </button>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type="number" min="1" step="0.1"
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
              placeholder="Ej: 45"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">km/gal</span>
          </div>
        </label>

        {/* Precio por galón */}
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-auto-500" /> Precio por galón (S/)
            </span>
            {defaults.ultimoPrecio && (
              <button onClick={usarUltimoPrecio} className="text-[10px] font-bold text-auto-500 bg-auto-600/10 px-2 py-0.5 rounded-full hover:bg-auto-600/15 transition-colors">
                S/ {defaults.ultimoPrecio}
              </button>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type="number" min="1" step="0.01"
              value={precioGalon}
              onChange={(e) => setPrecioGalon(e.target.value)}
              placeholder="Ej: 18.50"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">S/</span>
          </div>
        </label>

        {/* Peajes */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-500 block">Peajes (opcional)</span>

          {peajes.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-zinc-100 rounded-xl px-3 py-2">
              <span className="text-xs font-medium text-zinc-700 flex-1">{p.nombre}</span>
              <span className="text-xs font-bold text-zinc-800">S/ {p.costo.toFixed(2)}</span>
              <button onClick={() => eliminarPeaje(p.id)} className="text-zinc-500 hover:text-auto-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text" value={nuevoPeaje.nombre}
              onChange={(e) => setNuevoPeaje({ ...nuevoPeaje, nombre: e.target.value })}
              placeholder="Nombre"
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <input
              type="number" min="0" step="0.5" value={nuevoPeaje.costo}
              onChange={(e) => setNuevoPeaje({ ...nuevoPeaje, costo: e.target.value })}
              placeholder="S/"
              className="w-20 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
            <button
              onClick={agregarPeaje}
              disabled={!nuevoPeaje.costo || parseFloat(nuevoPeaje.costo) <= 0}
              className="px-3 py-2 rounded-xl bg-auto-600/15 text-auto-500 hover:bg-auto-200 transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pasajeros */}
        <label className="block">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-auto-500" /> Pasajeros (para dividir)
          </span>
          <input
            type="number" min="1" max="20" value={pasajeros}
            onChange={(e) => setPasajeros(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20"
          />
        </label>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-extrabold text-zinc-800 text-center">Presupuesto Estimado</h3>

          {/* Total grande */}
          <div className="text-center">
            <p className="text-4xl font-black text-auto-500">
              S/ {resultados.costoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Costo total del viaje</p>
          </div>

          {/* Barras de desglose */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-zinc-700">Combustible</span>
                <span className="font-bold text-zinc-800">S/ {resultados.costoCombustible.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-auto-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(resultados.barraCombustible, 5)}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{resultados.galonesNecesarios.toFixed(1)} galones · {resultados.combustiblePct.toFixed(0)}% del total</p>
            </div>

            {resultados.totalPeajes > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-zinc-700">Peajes</span>
                  <span className="font-bold text-zinc-800">S/ {resultados.totalPeajes.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-auto-600 rounded-full transition-all duration-500" style={{ width: `${resultados.barraPeajes}%` }} />
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">{peajes.length} peaje(s) · {resultados.peajesPct.toFixed(0)}% del total</p>
              </div>
            )}
          </div>

          {/* Por persona */}
          {parseInt(pasajeros) > 1 && (
            <div className="bg-auto-600/10 rounded-2xl p-3 text-center">
              <p className="text-xs text-zinc-500">Por persona ({pasajeros} pasajeros)</p>
              <p className="text-xl font-black text-auto-500">
                S/ {resultados.costoPorPersona.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Info adicional */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Distancia</p>
              <p className="text-sm font-bold text-zinc-800">{parseFloat(distancia).toLocaleString("es-PE")} km</p>
            </div>
            <div className="bg-zinc-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Combustible</p>
              <p className="text-sm font-bold text-zinc-800">{resultados.galonesNecesarios.toFixed(1)} gal</p>
            </div>
            <div className="bg-zinc-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Rendimiento</p>
              <p className="text-sm font-bold text-zinc-800">{parseFloat(rendimiento)} km/gal</p>
            </div>
            <div className="bg-zinc-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">S/ por km</p>
              <p className="text-sm font-bold text-zinc-800">
                S/ {(resultados.costoCombustible / parseFloat(distancia)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Completa los campos para ver el presupuesto</p>
          <p className="text-xs text-zinc-500 mt-1">Ingresa al menos distancia, rendimiento y precio por galón</p>
        </div>
      )}
    </div>
  );
}
