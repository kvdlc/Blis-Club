"use client";

import { useEffect } from "react";
import { Clock } from "lucide-react";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";

interface Props {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
  specs: VehicleSpecs | null;
}

export default function CarfaxPrintClient({ vehicle, fuelLogs, maintenances, upgrades, specs }: Props) {
  useEffect(() => {
    // Auto-imprimir al cargar
    const timer = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Calcular métricas
  const totalCombustible = fuelLogs.reduce((s, f) => s + f.precio_por_galon * (f.litros / 3.78541), 0);
  const totalMant = maintenances.reduce((s, m) => s + (m.costo || 0), 0);
  const totalUpgrades = upgrades.reduce((s, u) => s + (u.costo || 0), 0);
  const totalGeneral = totalCombustible + totalMant + totalUpgrades;

  // Rendimiento promedio
  let rendimientoPromedio = 0;
  if (fuelLogs.length >= 2) {
    const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
    let totalKm = 0, totalGal = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalKm += sorted[i].odometro - sorted[i - 1].odometro;
      totalGal += sorted[i - 1].litros / 3.78541;
    }
    if (totalGal > 0) rendimientoPromedio = Math.round(totalKm / totalGal);
  }

  // Km/año promedio (delta entre primer y último odómetro)
  const firstDate = fuelLogs.length > 0
    ? new Date(Math.min(...fuelLogs.map((f) => new Date(f.fecha).getTime())))
    : null;
  const primerOdometro = fuelLogs.length > 0
    ? Math.min(...fuelLogs.map((f) => f.odometro))
    : 0;
  const ultimoKmAjuste = fuelLogs.length > 0
    ? Math.max(...fuelLogs.map((f) => f.odometro))
    : vehicle.kilometraje;
  const kmAnual = firstDate
    ? Math.round(((ultimoKmAjuste - primerOdometro) / ((new Date().getTime() - firstDate.getTime()) / (365 * 24 * 60 * 60 * 1000))))
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-50 text-zinc-800 print:p-4 print:text-xs">
      {/* Solo mostrar en pantalla, ocultar al imprimir */}
      <div className="print:hidden mb-4 p-3 rounded-xl bg-auto-600/10 border border-auto-200 text-center">
        <p className="text-sm font-bold text-auto-500 flex items-center justify-center gap-1"><Clock className="w-4 h-4" /> Abriendo ventana de impresión...</p>
        <p className="text-xs text-auto-500 mb-2">Guarda como PDF para compartir con futuros compradores.</p>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold hover:bg-auto-500 transition-colors">
          Imprimir ahora
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-zinc-200">
        <h1 className="text-2xl font-black text-auto-500 print:text-xl">Reporte Carfax</h1>
        <p className="text-sm text-zinc-500 mt-1">Historial completo del vehículo</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Generado el {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Datos del vehículo */}
      <div className="mb-6">
        <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">1. Datos del Vehículo</h2>
        <div className="grid grid-cols-2 gap-2 bg-zinc-100 rounded-xl p-4 print:p-3">
          <Row label="Marca" value={vehicle.marca} />
          <Row label="Modelo" value={vehicle.modelo} />
          <Row label="Año" value={vehicle.año.toString()} />
          <Row label="Placa" value={vehicle.placa} />
          <Row label="Kilometraje actual" value={`${vehicle.kilometraje.toLocaleString("es-PE")} km`} />
          <Row label="Color" value={vehicle.color || "—"} />
          <Row label="VIN / Chasis" value={vehicle.vin || "—"} />
          <Row label="Estado" value={vehicle.estado === "activo" ? "Activo" : vehicle.estado === "en venta" ? "En venta" : vehicle.estado} />
          <Row label="Km por año (estimado)" value={`${kmAnual.toLocaleString("es-PE")} km`} />
          <Row label="Rendimiento promedio" value={rendimientoPromedio > 0 ? `${rendimientoPromedio} km/gal` : "Sin datos"} />
        </div>
      </div>

      {/* Especificaciones */}
      {specs && (
        <div className="mb-6">
          <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">2. Especificaciones del Fabricante</h2>
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 rounded-xl p-4 print:p-3">
            {specs.tipo_aceite && <Row label="Aceite" value={`${specs.tipo_aceite}${specs.viscosidad_aceite ? ` ${specs.viscosidad_aceite}` : ""}`} />}
            {specs.capacidad_aceite_litros && <Row label="Cap. aceite" value={`${specs.capacidad_aceite_litros} L`} />}
            {specs.tipo_refrigerante && <Row label="Refrigerante" value={specs.tipo_refrigerante} />}
            {specs.presion_neumaticos_delante && <Row label="PSI delante" value={`${specs.presion_neumaticos_delante} PSI`} />}
            {specs.presion_neumaticos_atras && <Row label="PSI atrás" value={`${specs.presion_neumaticos_atras} PSI`} />}
            {specs.capacidad_tanque_galones && <Row label="Tanque" value={`${specs.capacidad_tanque_galones} gal`} />}
            {specs.octanaje_recomendado && <Row label="Octanaje" value={specs.octanaje_recomendado} />}
          </div>
        </div>
      )}

      {/* Historial de combustible */}
      <div className="mb-6">
        <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">
          3. Historial de Combustible ({fuelLogs.length} cargas)
        </h2>
        {fuelLogs.length === 0 ? (
          <p className="text-xs text-zinc-500">Sin registros</p>
        ) : (
          <div className="bg-zinc-100 rounded-xl overflow-hidden print:text-[9px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-3 py-2 font-bold text-zinc-500">Fecha</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Odom.</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Litros</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">S/ gal</th>
                  <th className="px-3 py-2 font-bold text-zinc-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">{new Date(f.fecha + "T12:00:00").toLocaleDateString("es-PE")}</td>
                    <td className="px-3 py-2">{f.odometro.toLocaleString("es-PE")}</td>
                    <td className="px-3 py-2">{f.litros}</td>
                    <td className="px-3 py-2">S/ {f.precio_por_galon}</td>
                    <td className="px-3 py-2 text-right font-bold">S/ {Math.round(f.precio_por_galon * (f.litros / 3.78541)).toLocaleString("es-PE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de mantenimientos */}
      <div className="mb-6">
        <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">
          4. Historial de Mantenimientos ({maintenances.length} servicios)
        </h2>
        {maintenances.length === 0 ? (
          <p className="text-xs text-zinc-500">Sin registros</p>
        ) : (
          <div className="bg-zinc-100 rounded-xl overflow-hidden print:text-[9px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-3 py-2 font-bold text-zinc-500">Fecha</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Tipo</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Servicio</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Taller</th>
                  <th className="px-3 py-2 font-bold text-zinc-500 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">{new Date(m.fecha + "T12:00:00").toLocaleDateString("es-PE")}</td>
                    <td className="px-3 py-2 capitalize">{m.tipo}</td>
                    <td className="px-3 py-2">{m.titulo}</td>
                    <td className="px-3 py-2">{m.taller || "—"}</td>
                    <td className="px-3 py-2 text-right font-bold">{m.costo ? `S/ ${m.costo.toLocaleString("es-PE")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mejoras */}
      {upgrades.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">
            5. Mejoras y Accesorios ({upgrades.length} items)
          </h2>
          <div className="bg-zinc-100 rounded-xl overflow-hidden print:text-[9px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="px-3 py-2 font-bold text-zinc-500">Fecha</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Categoría</th>
                  <th className="px-3 py-2 font-bold text-zinc-500">Mejora</th>
                  <th className="px-3 py-2 font-bold text-zinc-500 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {upgrades.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">{new Date(u.fecha + "T12:00:00").toLocaleDateString("es-PE")}</td>
                    <td className="px-3 py-2 capitalize">{u.categoria}</td>
                    <td className="px-3 py-2">{u.nombre}</td>
                    <td className="px-3 py-2 text-right font-bold">{u.costo ? `S/ ${u.costo.toLocaleString("es-PE")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      <div className="mb-6">
        <h2 className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide mb-3">6. Resumen Financiero</h2>
        <div className="bg-zinc-100 rounded-xl p-4 print:p-3 space-y-2">
          <SummaryRow label="Total combustible" value={`S/ ${Math.round(totalCombustible).toLocaleString("es-PE")}`} />
          <SummaryRow label="Total mantenimientos" value={`S/ ${Math.round(totalMant).toLocaleString("es-PE")}`} />
          {totalUpgrades > 0 && <SummaryRow label="Total mejoras" value={`S/ ${Math.round(totalUpgrades).toLocaleString("es-PE")}`} />}
          <div className="pt-2 border-t border-zinc-200">
            <SummaryRow label="Inversión total" value={`S/ ${Math.round(totalGeneral).toLocaleString("es-PE")}`} bold />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-zinc-500 mt-8 pt-4 border-t border-zinc-200">
        <p>Reporte generado por Blis Club Auto — {new Date().toLocaleDateString("es-PE")}</p>
        <p>Este documento certifica el historial registrado por el propietario del vehículo.</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded-lg print:py-0.5">
      <span className="text-[10px] text-zinc-500 print:text-[8px]">{label}</span>
      <span className="text-xs font-bold text-zinc-800 print:text-[10px]">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? "text-sm font-extrabold text-zinc-800" : "text-xs text-zinc-500"}`}>{label}</span>
      <span className={`${bold ? "text-lg font-black text-auto-500" : "text-sm font-bold text-zinc-800"}`}>{value}</span>
    </div>
  );
}
