import type { Metadata } from "next";
import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import type { VehicleContact } from "@/types/database";

export const TIPO: Record<string, string> = {
  mecanico: "Mecánico",
  electromecanico: "Electromecánico",
  grua: "Grúa",
  tienda_repuestos: "Tienda de Repuestos",
  tienda_accesorios: "Tienda de Accesorios",
  aseguradora: "Aseguradora",
  grifo: "Grifo / Estación de servicio",
  otro: "Otro",
};

export const waLink = (full: string | null) => {
  const d = (full || "").replace(/[^0-9]/g, "");
  return d ? `https://wa.me/${d}` : "#";
};

export function publicTallerPath(c: Pick<VehicleContact, "id" | "share_slug">) {
  return c.share_slug ? `/t/${c.share_slug}` : `/auto/taller/${c.id}`;
}

export const getContactBySlug = cache(async (slug: string): Promise<VehicleContact | null> => {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("vehicle_contacts")
    .select("*")
    .eq("share_slug", slug)
    .maybeSingle();
  return (data as VehicleContact) || null;
});

export const getContactById = cache(async (id: string): Promise<VehicleContact | null> => {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("vehicle_contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as VehicleContact) || null;
});

export function tallerMetadata(c: VehicleContact | null): Metadata {
  if (!c) return { title: "Taller no encontrado · Blis Club Auto" };
  const desc =
    [TIPO[c.tipo] || "Taller", c.encargado, c.ubicacion].filter(Boolean).join(" · ") ||
    "Datos guardados en Blis Club Auto";
  const title = `Blis Club - ${c.nombre}`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}
