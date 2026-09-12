import type { Metadata } from "next";
import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import type { VehicleContact } from "@/types/database";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

const TIPO: Record<string, string> = {
  mecanico: "Mecánico",
  electromecanico: "Electromecánico",
  grua: "Grúa",
  tienda_repuestos: "Tienda de Repuestos",
  tienda_accesorios: "Tienda de Accesorios",
  aseguradora: "Aseguradora",
  grifo: "Grifo / Estación de servicio",
  otro: "Otro",
};

const waLink = (full: string | null) => {
  const d = (full || "").replace(/[^0-9]/g, "");
  return d ? `https://wa.me/${d}` : "#";
};

const getContact = cache(async (id: string): Promise<VehicleContact | null> => {
  const supabase = createServiceClient();
  const { data } = await supabase.from("vehicle_contacts").select("*").eq("id", id).single();
  return (data as VehicleContact) || null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await getContact(id);
  if (!c) return { title: "Taller no encontrado · Blis Club Auto" };
  const desc =
    [TIPO[c.tipo] || "Taller", c.encargado, c.ubicacion].filter(Boolean).join(" · ") ||
    "Datos guardados en Blis Club Auto";
  return {
    title: `${c.nombre} · Blis Club Auto`,
    description: desc,
    openGraph: {
      title: c.nombre,
      description: desc,
      images: c.foto_url ? [c.foto_url] : undefined,
    },
  };
}

export default async function PublicTallerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getContact(id);

  if (!c) {
    return (
      <main className="min-h-screen bg-auto-gradient flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-8 text-center max-w-sm">
          <p className="text-4xl mb-3">🔧</p>
          <h1 className="text-lg font-extrabold text-zinc-100">Taller no encontrado</h1>
          <p className="text-sm text-zinc-400 mt-1">
            El enlace puede haber cambiado o el taller fue eliminado.
          </p>
        </div>
      </main>
    );
  }

  const principal = c.telefono || c.whatsapp;
  const mapHref =
    c.lat != null && c.lng != null && !isNaN(c.lat)
      ? `https://www.google.com/maps?q=${c.lat},${c.lng}`
      : c.ubicacion
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.ubicacion)}`
        : null;

  const shareText = `${c.nombre}${c.encargado ? ` (${c.encargado})` : ""}${principal ? ` · ${principal}` : ""} · Guardado en Blis Club Auto`;

  return (
    <main className="min-h-screen bg-auto-gradient">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl grad-auto flex items-center justify-center text-white font-black">
            B
          </div>
          <div>
            <p className="text-sm font-extrabold text-zinc-100 leading-none">
              Blis Club <span className="text-auto-400">Auto</span>
            </p>
            <p className="text-[10px] text-zinc-500">Taller compartido</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="h-52 bg-auto-panel flex items-center justify-center relative">
            {c.foto_url ? (
              <img src={c.foto_url} alt={c.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🔧</span>
            )}
            {c.es_emergencia && (
              <span className="absolute top-3 left-3 text-[10px] font-bold text-red-300 bg-red-500/20 border border-red-500/30 backdrop-blur px-2 py-1 rounded-full">
                SOS · Emergencia
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h1 className="text-xl font-extrabold text-zinc-100 leading-tight">{c.nombre}</h1>
              <p className="text-xs text-auto-400 font-semibold mt-0.5">
                {TIPO[c.tipo] || "Taller"}
              </p>
              {c.encargado && (
                <p className="text-sm text-zinc-400 mt-1">Atiende: {c.encargado}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={principal ? `tel:${principal}` : "#"}
                className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                📞 Llamar
              </a>
              <a
                href={principal ? waLink(principal) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
              >
                💬 WhatsApp
              </a>
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-auto-500/10 border border-auto-500/25 text-auto-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                >
                  📍 Mapa
                </a>
              ) : (
                <span />
              )}
            </div>

            {(principal || c.telefono_alt) && (
              <div className="glass-input rounded-2xl p-3 space-y-1">
                {principal && (
                  <p className="text-sm text-zinc-200 tabular-nums">📞 {principal}</p>
                )}
                {c.telefono_alt && c.telefono_alt !== principal && (
                  <p className="text-sm text-zinc-400 tabular-nums">📞 {c.telefono_alt}</p>
                )}
              </div>
            )}

            {c.ubicacion && (
              <p className="text-sm text-zinc-400 flex gap-2">
                <span>📍</span>
                {c.ubicacion}
              </p>
            )}
            {c.notas && (
              <p className="text-sm text-zinc-400 whitespace-pre-line">{c.notas}</p>
            )}

            <ShareButton
              url={`/auto/taller/${c.id}`}
              title={c.nombre}
              text={shareText}
              label="Compartir este taller"
              className="w-full py-3 rounded-xl grad-auto text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-4">
          Guardado en <span className="text-zinc-400 font-semibold">Blis Club · Auto</span> — tu copiloto de confianza.
        </p>
      </div>
    </main>
  );
}
