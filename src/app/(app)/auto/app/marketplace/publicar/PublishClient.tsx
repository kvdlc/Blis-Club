"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadMarketplacePhoto } from "@/lib/storage";
import Link from "next/link";
import { ArrowLeft, X, Upload, Car, Check } from "lucide-react";
import { useMoney } from "@/lib/money";
import type { Vehicle, Profile } from "@/types/database";

interface Props {
  userId: string;
  myVehicles: Vehicle[];
  profile: Pick<Profile, "display_name" | "whatsapp" | "country"> | null;
}

function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80) + "-" + Math.random().toString(36).substring(2, 8);
}

export default function PublishClient({ userId, myVehicles, profile }: Props) {
  const { symbol } = useMoney();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [precio, setPrecio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [fotosExtra, setFotosExtra] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const selected = myVehicles.find((v) => v.id === selectedId) || null;

  const addFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const done = [...fotosExtra];
    for (const file of files) {
      if (done.length >= 5) break;
      const url = await uploadMarketplacePhoto(file, (selected?.id || "auto") + "-" + file.name.replace(/\.[^.]+$/, ""));
      if (url) done.push(url);
    }
    setFotosExtra(done);
    setUploading(false);
    e.target.value = "";
  };

  const removeFoto = (i: number) => setFotosExtra(fotosExtra.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) { alert("Ingresa un precio válido."); return; }
    const cleanPhone = whatsapp.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8) { alert("Ingresa un WhatsApp válido (mínimo 8 dígitos)."); return; }

    setSaving(true);
    const supabase = createClient();
    const titulo = `${selected.marca} ${selected.modelo} ${selected.año}`.trim();
    const fotos = [selected.foto_url, ...fotosExtra].filter(Boolean) as string[];

    // Marcar el vehículo como en venta + precio
    await supabase.from("vehicles").update({ estado: "en venta", precio: precioNum }).eq("id", selected.id);

    // Upsert del listing vinculado al vehículo
    const slug = generateSlug(titulo);
    const listingPayload = {
      user_id: userId,
      vehicle_id: selected.id,
      slug,
      titulo,
      categoria: "autos_usados" as const,
      marca: selected.marca,
      modelo: selected.modelo,
      estado_item: "usado" as const,
      precio: precioNum,
      descripcion: `Vehículo ${selected.marca} ${selected.modelo} ${selected.año}. ${selected.color ? `Color ${selected.color}. ` : ""}${selected.kilometraje.toLocaleString("es-PE")} km.`,
      fotos,
      whatsapp: whatsapp.replace(/[^0-9+]/g, ""),
      ciudad: ciudad || null,
      activo: true,
    };

    const { data: existing } = await supabase
      .from("marketplace_listings")
      .select("id, slug")
      .eq("vehicle_id", selected.id)
      .maybeSingle();

    let finalSlug = existing?.slug || slug;
    let insertError: string | null = null;
    if (existing) {
      const { error } = await supabase.from("marketplace_listings").update(listingPayload).eq("id", existing.id);
      insertError = error ? error.message : null;
    } else {
      const { data: created, error } = await supabase.from("marketplace_listings").insert(listingPayload).select("slug").single();
      insertError = error ? error.message : null;
      if (created?.slug) finalSlug = created.slug;
    }

    setSaving(false);

    if (insertError) {
      alert("Error al publicar: " + insertError);
    } else {
      router.push(`/auto/app/marketplace/${finalSlug}`);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Vender mi vehículo</h1>
        <p className="text-xs text-zinc-500 mt-1">Elige tu auto, ponle precio y publícalo. Solo puedes vender tus propios vehículos.</p>
      </div>

      {myVehicles.length === 0 ? (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-8 text-center">
          <Car className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-500">No tienes vehículos registrados.</p>
          <Link href="/auto/app/perfil/vehiculo/nuevo" className="inline-block mt-3 px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold">
            Registrar mi vehículo
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Elegir vehículo */}
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Mi vehículo *</span>
            <select required value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20">
              <option value="">— Selecciona tu auto —</option>
              {myVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.marca} {v.modelo} {v.año} · {v.placa}{v.estado === "en venta" ? " (en venta)" : ""}</option>
              ))}
            </select>
          </label>

          {selected && (
            <div className="rounded-2xl border border-auto-500/20 bg-auto-500/[0.04] p-3 flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                {selected.foto_url ? <img src={selected.foto_url} alt="" className="w-full h-full object-cover" /> : <Car className="w-8 h-8 text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-100">{selected.marca} {selected.modelo}</p>
                <p className="text-[10px] text-zinc-500">{selected.año} · {selected.placa}</p>
                <p className="text-[10px] text-zinc-500">{selected.kilometraje.toLocaleString("es-PE")} km · {selected.color || "Sin color"}</p>
              </div>
              <Check className="w-5 h-5 text-auto-400 shrink-0" />
            </div>
          )}

          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Precio ({symbol}) *</span>
            <input required type="number" min="1" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej: 45000"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">Ciudad</span>
              <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Lima"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">WhatsApp *</span>
              <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+51 999 888 777"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            </label>
          </div>

          {/* Fotos extra */}
          <div>
            <span className="text-xs font-bold text-zinc-500">Fotos adicionales (opcional, máx 5)</span>
            <label className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-white/15 bg-zinc-900 text-sm cursor-pointer hover:bg-zinc-800/60 transition-colors mt-1 ${uploading ? "opacity-60" : ""}`}>
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-400">{uploading ? "Subiendo..." : "Agregar fotos"}</span>
              <input type="file" accept="image/*" multiple onChange={addFotos} className="hidden" disabled={uploading} />
            </label>
            {fotosExtra.length > 0 && (
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {fotosExtra.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFoto(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving || !selected}
            className="w-full py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-auto-600/20">
            {saving ? "Publicando..." : "Publicar mi vehículo"}
          </button>
        </form>
      )}
    </div>
  );
}
