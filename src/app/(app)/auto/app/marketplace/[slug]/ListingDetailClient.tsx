"use client";

import Link from "next/link";
import type { MarketplaceListing } from "@/types/database";
import { ArrowLeft, MapPin, Tag, MessageCircle, Package } from "lucide-react";

const categoryLabels: Record<string, string> = {
  repuestos: "Repuestos", accesorios: "Accesorios", servicios: "Servicios",
  cupones: "Cupones", autos_usados: "Autos Usados",
};

interface Props {
  listing: MarketplaceListing & { profiles?: { display_name?: string; avatar_url?: string; whatsapp?: string } | null };
}

export default function ListingDetailClient({ listing }: Props) {
  const sellerWhatsapp = listing.whatsapp || "";
  const sellerName = listing.profiles?.display_name || "Vendedor";

  // Formatear mensaje de WhatsApp
  const cleanPhone = sellerWhatsapp.replace(/[^0-9]/g, "");
  const mensaje = encodeURIComponent(
    `Hola, vi tu publicación "${listing.titulo}" en Blis Club Marketplace. ¿Sigue disponible?`
  );
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${mensaje}` : null;

  return (
    <div className="space-y-4">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      {/* Galería */}
      <div className="rounded-2xl overflow-hidden bg-white/5">
        {listing.fotos?.[0] ? (
          <img src={listing.fotos[0]} alt={listing.titulo} className="w-full h-64 object-cover" />
        ) : (
          <div className="h-64 flex items-center justify-center"><Package className="w-16 h-16 text-zinc-500" /></div>
        )}
      </div>

      {/* Info principal */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold text-zinc-200 flex-1">{listing.titulo}</h1>
          <p className="text-2xl font-black text-auto-500 shrink-0">
            {listing.precio === 0 ? "Gratis" : `S/ ${listing.precio.toLocaleString("es-PE")}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            listing.estado_item === "nuevo" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-400"
          }`}>
            {listing.estado_item === "nuevo" ? "Nuevo" : "Usado"}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-auto-600/15 text-auto-500">
            {categoryLabels[listing.categoria] || listing.categoria}
          </span>
          {listing.marca && (
            <span className="text-xs text-zinc-400">{listing.marca}{listing.modelo ? ` ${listing.modelo}` : ""}</span>
          )}
        </div>
      </div>

      {/* Descripción */}
      {listing.descripcion && (
        <div className="card-auto-dark rounded-2xl p-4">
          <h3 className="text-xs font-extrabold text-zinc-300 mb-2">Descripción</h3>
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{listing.descripcion}</p>
        </div>
      )}

      {/* Detalles */}
      <div className="card-auto-dark rounded-2xl p-4 grid grid-cols-2 gap-3">
        {listing.ciudad && (
          <div>
            <p className="text-[10px] text-zinc-500">Ubicación</p>
            <p className="text-sm font-bold text-zinc-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {listing.ciudad}
            </p>
          </div>
        )}
        {listing.marca && (
          <div>
            <p className="text-[10px] text-zinc-500">Marca</p>
            <p className="text-sm font-bold text-zinc-200">{listing.marca}</p>
          </div>
        )}
        {listing.modelo && (
          <div>
            <p className="text-[10px] text-zinc-500">Modelo</p>
            <p className="text-sm font-bold text-zinc-200">{listing.modelo}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-zinc-500">Vendedor</p>
          <p className="text-sm font-bold text-zinc-200">{sellerName}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500">Publicado</p>
          <p className="text-sm font-bold text-zinc-200">
            {new Date(listing.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      {/* Botón WhatsApp */}
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <MessageCircle className="w-5 h-5" />
          Contactar por WhatsApp
        </a>
      ) : (
        <div className="w-full py-3.5 rounded-2xl bg-white/5 text-zinc-500 text-sm font-bold text-center">
          WhatsApp no disponible
        </div>
      )}
    </div>
  );
}
