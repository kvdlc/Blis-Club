"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing, VehicleSpecs } from "@/types/database";
import { ArrowLeft, MapPin, MessageCircle, Heart, ShieldCheck, Gauge, EyeOff, Check, Tag, Star } from "lucide-react";
import { useMoney } from "@/lib/money";

const categoryLabels: Record<string, string> = {
  repuestos: "Repuestos", accesorios: "Accesorios", servicios: "Servicios",
  cupones: "Cupones", autos_usados: "Autos Usados",
};

function ratingFor(id: string): { stars: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const stars = 3.5 + (h % 15) / 10;
  const count = 10 + (h % 90);
  return { stars: Math.min(5, Math.round(stars * 10) / 10), count };
}

interface Props {
  listing: MarketplaceListing & { profiles?: { display_name?: string; avatar_url?: string; whatsapp?: string } | null };
  isOwner: boolean;
  userId: string | null;
  similares: MarketplaceListing[];
  specs: VehicleSpecs | null;
}

export default function ListingDetailClient({ listing, isOwner, userId, similares, specs }: Props) {
  const { money } = useMoney();
  const router = useRouter();
  const [activoImg, setActivoImg] = useState(0);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    createClient().from("marketplace_favorites").select("listing_id").eq("user_id", userId).eq("listing_id", listing.id)
      .then(({ data }) => setFav((data?.length ?? 0) > 0));
  }, [userId, listing.id]);

  const galeria = (listing.fotos?.length ? listing.fotos : []) as string[];

  const cleanPhone = (listing.whatsapp || "").replace(/[^0-9]/g, "");
  const mensaje = encodeURIComponent(`Hola, vi tu publicación "${listing.titulo}" en Blis Club Marketplace. ¿Sigue disponible?`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${mensaje}` : null;

  const r = ratingFor(listing.id);

  const toggleFav = async () => {
    if (!userId) return;
    const supabase = createClient();
    if (fav) await supabase.from("marketplace_favorites").delete().eq("user_id", userId).eq("listing_id", listing.id);
    else await supabase.from("marketplace_favorites").insert({ user_id: userId, listing_id: listing.id });
    setFav(!fav);
  };

  const changeEstado = async (estado: "activo" | "vendido") => {
    if (!listing.vehicle_id) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("vehicles").update({ estado }).eq("id", listing.vehicle_id);
    if (estado === "vendido" || estado === "activo") {
      const activo = estado === "activo";
      await supabase.from("marketplace_listings").update({ activo }).eq("id", listing.id);
    }
    setBusy(false);
    router.refresh();
    router.push("/auto/app/marketplace");
  };

  const specsRows: { label: string; value: string | null }[] = specs ? [
    { label: "Tipo de aceite", value: specs.tipo_aceite },
    { label: "Viscosidad", value: specs.viscosidad_aceite },
    { label: "Tanque", value: specs.capacidad_tanque_galones != null ? `${specs.capacidad_tanque_galones} ${specs.tanque_unidad || ""}` : null },
    { label: "Octanaje", value: specs.octanaje_recomendado },
  ].filter((x) => x.value != null) : [];

  return (
    <div className="space-y-4 pb-10">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      {/* Galería */}
      <div className="rounded-2xl overflow-hidden bg-zinc-800 relative aspect-square">
        {galeria[activoImg] ? (
          <img src={galeria[activoImg]} alt={listing.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-6xl">🚗</span></div>
        )}
        {galeria.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {galeria.map((f, i) => (
              <button key={i} type="button" onClick={() => setActivoImg(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${activoImg === i ? "border-auto-500" : "border-transparent opacity-70"}`}>
                <img src={f} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-auto-600/15 text-auto-400">{listing.marca || "Auto"}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${listing.estado_item === "nuevo" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                {listing.estado_item === "nuevo" ? "Nuevo" : "Usado"}
              </span>
            </div>
            <h1 className="text-xl font-black text-zinc-100 mt-1 leading-tight">{listing.titulo}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(r.stars) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
                ))}
              </div>
              <span className="text-[11px] text-zinc-500">{r.stars} ({r.count})</span>
            </div>
          </div>
          <button type="button" onClick={toggleFav} aria-label="Favorito"
            className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center transition-transform active:scale-90">
            <Heart className={`w-5 h-5 ${fav ? "text-red-500 fill-red-500" : "text-zinc-400"}`} />
          </button>
        </div>

        <p className="text-3xl font-black text-auto-500">{listing.precio === 0 ? "Gratis" : money(listing.precio)}</p>
      </div>

      {/* Datos técnicos */}
      <div className="grid grid-cols-2 gap-2">
        {listing.ciudad && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Ubicación</p>
            <p className="text-sm font-bold text-zinc-200">{listing.ciudad}</p>
          </div>
        )}
        {listing.marca && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] text-zinc-500">Marca / modelo</p>
            <p className="text-sm font-bold text-zinc-200">{listing.marca} {listing.modelo}</p>
          </div>
        )}
        {specs?.presion_neumaticos_delante && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] text-zinc-500 flex items-center gap-1"><Gauge className="w-3 h-3" /> Presión delantera</p>
            <p className="text-sm font-bold text-zinc-200">{specs.presion_neumaticos_delante} PSI</p>
          </div>
        )}
        {specs?.presion_neumaticos_atras && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] text-zinc-500 flex items-center gap-1"><Gauge className="w-3 h-3" /> Presión trasera</p>
            <p className="text-sm font-bold text-zinc-200">{specs.presion_neumaticos_atras} PSI</p>
          </div>
        )}
      </div>

      {/* Specs extra */}
      {specsRows.length > 0 && (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-2">
          <h3 className="text-[11px] font-extrabold text-zinc-300 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Ficha técnica</h3>
          {specsRows.map((s) => (
            <div key={s.label} className="flex justify-between text-xs">
              <span className="text-zinc-500">{s.label}</span>
              <span className="font-bold text-zinc-200">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Descripción */}
      {listing.descripcion && (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
          <h3 className="text-xs font-extrabold text-zinc-300 mb-2">Descripción</h3>
          <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{listing.descripcion}</p>
        </div>
      )}

      {/* Vendedor */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center">
          <span className="text-base font-black text-auto-500">{listing.profiles?.display_name?.charAt(0) || "V"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-100 truncate">{listing.profiles?.display_name || "Vendedor"}</p>
          <p className="text-[10px] text-zinc-500">Publicado {new Date(listing.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Verificado</span>
      </div>

      {/* Botón WhatsApp */}
      {whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
          <MessageCircle className="w-5 h-5" /> Contactar por WhatsApp
        </a>
      ) : (
        <div className="w-full py-3.5 rounded-2xl bg-zinc-800 text-zinc-500 text-sm font-bold text-center">WhatsApp no disponible</div>
      )}

      {/* Acciones del dueño */}
      {isOwner && listing.vehicle_id && (
        <div className="space-y-2 bg-zinc-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-extrabold text-zinc-300 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Acciones del vendedor</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy} onClick={() => changeEstado("vendido")}
              className="py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold disabled:opacity-50">
              Marcar como vendido
            </button>
            <button type="button" disabled={busy} onClick={() => changeEstado("activo")}
              className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1">
              <EyeOff className="w-3.5 h-3.5" /> Quitar de venta
            </button>
          </div>
        </div>
      )}

      {/* Similares */}
      {similares.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-black text-zinc-100">Autos similares</h3>
          <div className="grid grid-cols-2 gap-2">
            {similares.map((s) => (
              <Link key={s.id} href={`/auto/app/marketplace/${s.slug}`}
                className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {s.fotos?.[0] ? <img src={s.fotos[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">🚗</span>}
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-[11px] font-bold text-zinc-200 line-clamp-1">{s.titulo}</p>
                  <p className="text-xs font-black text-auto-500">{s.precio === 0 ? "Gratis" : money(s.precio)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
