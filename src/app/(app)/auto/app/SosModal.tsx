"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { getCurrentCountryCode } from "@/lib/countries";
import { emergencyForCountry } from "@/lib/emergency";
import type { Vehicle, VehicleContact } from "@/types/database";
import {
  Siren, X, Phone, MessageCircle, MapPin, Copy, Check, Navigation,
  AlertTriangle, Car, TriangleAlert, Truck,
} from "lucide-react";

const TIPO_EMERGENCIA = ["grua", "aseguradora"];
const TIPO_MECANICO = ["mecanico", "electromecanico"];
const TIPO_OTRO = ["grifo", "tienda_repuestos", "tienda_accesorios", "otro"];

interface Props {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

/** Mini-guía por situación */
const GUIA: Record<string, { titulo: string; pasos: string[] }> = {
  pinchazo: {
    titulo: "Pinchazo / llanta",
    pasos: [
      "Reduce velocidad sin frenar bruscamente y oríllate en lugar seguro y plano.",
      "Activa las luces de emergencia y coloca triángulos a ~30-50 m.",
      "Usa freno de mano, chaleco reflectante si lo tienes.",
      "Si no puedes cambiar la llanta, llama a tu grúa o seguro.",
    ],
  },
  bateria: {
    titulo: "Batería descargada",
    pasos: [
      "Verifica que no quedaron luces/equipo encendidos.",
      "Pide puente con cables a otro vehículo (rojo con rojo, negro a masa).",
      "Si no arranca, llama a tu seguro (asistencia de batería) o mecánico.",
    ],
  },
  sin_gasolina: {
    titulo: "Sin combustible",
    pasos: [
      "Oríllate en lugar seguro y apaga el motor.",
      "Ubica el grifo más cercano en tu app de mapas.",
      "Pide auxilio con un bidón o llama a tu contacto de emergencia.",
    ],
  },
  averia: {
    titulo: "Avería / no arranca",
    pasos: [
      "No insistas si se apaga: detente y evalúa.",
      "Revisa indicadores del tablero (temperatura, aceite).",
      "Llama a tu mecánico de confianza o a la grúa del seguro.",
    ],
  },
  accidente: {
    titulo: "Accidente",
    pasos: [
      "Prioriza tu seguridad: enciende luces, chaleco y triángulos.",
      "Llama a emergencias si hay heridos (números del país abajo).",
      "No muevas el auto hasta documentar con fotos (a menos que obstruya).",
      "Toma datos del otro vehículo y testigos. Avisa a tu seguro.",
    ],
  },
};

export function SosModal({ vehicle, open, onClose }: Props) {
  const [contacts, setContacts] = useState<VehicleContact[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [copiedCar, setCopiedCar] = useState(false);
  const [copiedLoc, setCopiedLoc] = useState(false);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [situacion, setSituacion] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoc(null); setLocError(null); setSituacion(null);
    getCurrentCountryCode().then(setCountry);
    createClient()
      .from("vehicle_contacts")
      .select("*")
      .eq("vehicle_id", vehicle.id)
      .order("es_emergencia", { ascending: false })
      .order("nombre")
      .then(({ data }) => setContacts((data as VehicleContact[] | null) ?? []));
  }, [open, vehicle.id]);

  // Esc para cerrar + bloquear scroll del fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const emergency = contacts.filter((c) => c.es_emergencia === true);
  const porTipo = (tipos: string[]) => contacts.filter((c) => !c.es_emergencia && tipos.includes(c.tipo));
  const grupos: { titulo: string; items: VehicleContact[] }[] = [];
  if (emergency.length) grupos.push({ titulo: "🚨 Emergencia (SOS)", items: emergency });
  if (porTipo(TIPO_EMERGENCIA).length) grupos.push({ titulo: "🛟 Grúa / Aseguradora", items: porTipo(TIPO_EMERGENCIA) });
  if (porTipo(TIPO_MECANICO).length) grupos.push({ titulo: "🔧 Mecánico", items: porTipo(TIPO_MECANICO) });
  if (porTipo(TIPO_OTRO).length) grupos.push({ titulo: "📍 Otros contactos", items: porTipo(TIPO_OTRO) });
  const numerosPais = emergencyForCountry(country);

  const datosVehiculo = `${vehicle.marca} ${vehicle.modelo} ${vehicle.año} · Placa ${vehicle.placa}${vehicle.color ? ` · ${vehicle.color}` : ""}${vehicle.vin ? ` · VIN ${vehicle.vin}` : ""}`;

  const waLink = (numero: string | null, texto: string) => {
    const n = (numero || "").replace(/[^0-9]/g, "");
    if (!n) return "#";
    return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
  };

  const copiar = async (texto: string, kind: "car" | "loc") => {
    try { await navigator.clipboard.writeText(texto); } catch { /* noop */ }
    if (kind === "car") { setCopiedCar(true); setTimeout(() => setCopiedCar(false), 1800); }
    else { setCopiedLoc(true); setTimeout(() => setCopiedLoc(false), 1800); }
  };

  const obtenerUbicacion = () => {
    if (!("geolocation" in navigator)) { setLocError("Tu navegador no soporta geolocalización."); return; }
    setLocating(true); setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { setLocError("No se pudo obtener tu ubicación. Permite el acceso."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const mapsUrl = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : "";
  const mensajeUbicacion = loc
    ? `🚨 Necesito ayuda. Vehículo: ${datosVehiculo}. Mi ubicación: ${mapsUrl}`
    : "";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-zinc-900 border border-white/10 p-4 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-100 leading-tight">Asistencia en carretera</h2>
              <p className="text-[10px] text-zinc-500">Todo lo que necesitas en una emergencia</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vehículo */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
            {vehicle.foto_url ? <img src={vehicle.foto_url} alt="" className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-zinc-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-100">{vehicle.marca} {vehicle.modelo}</p>
            <p className="text-[10px] text-zinc-400">{vehicle.año} · {vehicle.color || "Sin color"}</p>
            <p className="text-[11px] font-black tracking-wide text-zinc-300">{vehicle.placa}</p>
          </div>
          <button
            type="button"
            onClick={() => copiar(datosVehiculo, "car")}
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-auto-400 bg-auto-600/10 border border-auto-600/25 px-2.5 py-1.5 rounded-lg hover:bg-auto-600/20"
          >
            {copiedCar ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copiedCar ? "Copiado" : "Copiar datos"}
          </button>
        </div>

        {/* Ubicación */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-auto-400" />
            <p className="text-xs font-bold text-zinc-200">Compartir mi ubicación</p>
          </div>
          {!loc ? (
            <button type="button" onClick={obtenerUbicacion} disabled={locating}
              className="w-full py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {locating ? "Obteniendo ubicación…" : "Usar mi ubicación actual"}
            </button>
          ) : (
            <div className="space-y-2">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] text-auto-300 underline break-all">
                <MapPin className="w-3 h-3 shrink-0" /> {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} — ver en Google Maps
              </a>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => copiar(mapsUrl, "loc")}
                  className="py-2 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center justify-center gap-1">
                  {copiedLoc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copiedLoc ? "Copiado" : "Copiar enlace"}
                </button>
                <a href={waLink(emergency[0]?.whatsapp || emergency[0]?.telefono || porTipo(TIPO_EMERGENCIA)[0]?.whatsapp || porTipo(TIPO_EMERGENCIA)[0]?.telefono, mensajeUbicacion)}
                  target="_blank" rel="noopener noreferrer"
                  className="py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-[10px] font-bold text-green-300 flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Enviar por WhatsApp
                </a>
              </div>
            </div>
          )}
          {locError && <p className="text-[10px] text-red-400">{locError}</p>}
          {loc && emergency.length === 0 && porTipo(TIPO_EMERGENCIA).length === 0 && (
            <p className="text-[9px] text-zinc-500">Para "Enviar por WhatsApp" agrega un contacto marcado como SOS o de grúa/aseguradora en tu directorio.</p>
          )}
        </div>

        {/* Contactos */}
        <div className="space-y-2.5">
          {grupos.length === 0 && (
            <div className="bg-zinc-800/50 rounded-2xl p-3 text-center">
              <p className="text-xs text-zinc-400">Aún no tienes contactos de emergencia.</p>
              <p className="text-[10px] text-zinc-500 mt-1">Agrega tu grúa, mecánico o aseguradora en <b>Guantera → Directorio</b> y márcalos como SOS.</p>
            </div>
          )}
          {grupos.map((g) => (
            <div key={g.titulo} className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wide">{g.titulo}</p>
              {g.items.map((c) => (
                <div key={c.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{c.nombre}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{c.telefono || "Sin teléfono"}</p>
                  </div>
                  {c.telefono && (
                    <a href={`tel:${c.telefono.replace(/[^0-9+]/g, "")}`} className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {(c.whatsapp || c.telefono) && (
                    <a href={waLink(c.whatsapp || c.telefono, `🚨 Necesito ayuda. Vehículo: ${datosVehiculo}.`) } target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-300">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Números del país */}
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Emergencias ({country || "tu país"})
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {numerosPais.map((n) => (
              <a key={n.label + n.number} href={`tel:${n.number}`}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]">
                <span className="text-base">{n.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-zinc-500 truncate">{n.label}</p>
                  <p className="text-xs font-black text-red-300">{n.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Guía por situación */}
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> ¿Qué te pasó?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(GUIA).map(([key, g]) => (
              <button key={key} type="button" onClick={() => setSituacion(situacion === key ? null : key)}
                className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${situacion === key ? "bg-auto-600 text-white border-auto-600" : "bg-white/[0.05] text-zinc-300 border-white/10 hover:bg-white/[0.1]"}`}>
                {g.titulo}
              </button>
            ))}
          </div>
          {situacion && (
            <div className="bg-auto-500/[0.06] border border-auto-500/20 rounded-2xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-auto-300 flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5" /> {GUIA[situacion].titulo}</p>
              {GUIA[situacion].pasos.map((p, i) => (
                <p key={i} className="text-[11px] text-zinc-300 flex gap-1.5">
                  <span className="text-auto-400 font-black shrink-0">{i + 1}.</span> {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
