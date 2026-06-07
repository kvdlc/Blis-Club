"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadDogPhoto } from "@/lib/storage";
import {
  ArrowLeft, Check, Eye, Globe, Camera, Trash2, GripVertical,
  Sparkles, Award, Zap, TrendingDown, Syringe, Utensils, Activity, Phone, Heart, Loader2, Copy,
} from "lucide-react";
import type { DogPublicProfile } from "@/types/database";

interface Props {
  dogId: string;
  dogName: string;
  userId: string;
  initialConfig: DogPublicProfile | null;
  ownerWhatsapp: string | null;
}

const CURRENCIES = ["USD", "MXN", "ARS", "COP", "PEN", "CLP", "EUR", "BRL"];

interface SectionToggle {
  key: keyof DogPublicProfile["sections_visible"];
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: SectionToggle[] = [
  { key: "stats", label: "Estadísticas", icon: <Activity className="w-4 h-4" /> },
  { key: "gallery", label: "Galería de fotos", icon: <Camera className="w-4 h-4" /> },
  { key: "badges", label: "Insignias", icon: <Award className="w-4 h-4" /> },
  { key: "agility", label: "Agilidad", icon: <Zap className="w-4 h-4" /> },
  { key: "weight", label: "Progreso de peso", icon: <TrendingDown className="w-4 h-4" /> },
  { key: "medical", label: "Vacunas", icon: <Syringe className="w-4 h-4" /> },
  { key: "diet", label: "Alimentación", icon: <Utensils className="w-4 h-4" /> },
  { key: "breeding", label: "Busca Novi@", icon: <Heart className="w-4 h-4" /> },
  { key: "contact", label: "Datos de contacto", icon: <Phone className="w-4 h-4" /> },
];

const MAX_GALLERY = 8;

export function PublicProfileConfigClient({ dogId, dogName, userId, initialConfig, ownerWhatsapp }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const defaultVis = initialConfig?.sections_visible ?? {
    badges: true, gallery: true, stats: true, agility: true,
    weight: true, medical: true, diet: true, breeding: false, contact: false,
  };

  const [bio, setBio] = useState(initialConfig?.bio ?? "");
  const [city, setCity] = useState(initialConfig?.city ?? "");
  const [contactPhone, setContactPhone] = useState(initialConfig?.contact_phone ?? "");
  const [contactEmail, setContactEmail] = useState(initialConfig?.contact_email ?? "");
  const [sectionsVisible, setSectionsVisible] = useState(defaultVis);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(initialConfig?.gallery_photos ?? []);
  const [breedingActive, setBreedingActive] = useState(initialConfig?.breeding_active ?? false);
  const [breedingInquiryOnly, setBreedingInquiryOnly] = useState(initialConfig?.breeding_inquiry_only ?? true);
  const [breedingCurrency, setBreedingCurrency] = useState(initialConfig?.breeding_currency ?? "USD");
  const [breedingAmount, setBreedingAmount] = useState(initialConfig?.breeding_amount ?? "");
  const [breedingDescription, setBreedingDescription] = useState(initialConfig?.breeding_description ?? "");

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSection = (key: keyof DogPublicProfile["sections_visible"]) => {
    setSectionsVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = useCallback(async () => {
    const payload = {
      dog_id: dogId,
      bio: bio || null,
      city: city || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      sections_visible: sectionsVisible,
      gallery_photos: galleryPhotos,
      breeding_active: breedingActive,
      breeding_inquiry_only: breedingInquiryOnly,
      breeding_currency: breedingCurrency,
      breeding_amount: breedingAmount || null,
      breeding_description: breedingDescription || null,
    };

    await supabase.from("dog_public_profiles").upsert(payload, { onConflict: "dog_id" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [bio, city, contactPhone, contactEmail, sectionsVisible, galleryPhotos,
      breedingActive, breedingInquiryOnly, breedingCurrency, breedingAmount, breedingDescription, dogId, supabase]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [save]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (galleryPhotos.length + files.length > MAX_GALLERY) {
      alert(`Máximo ${MAX_GALLERY} fotos. Puedes subir ${MAX_GALLERY - galleryPhotos.length} más.`);
      return;
    }
    setUploading(true);
    for (const file of files) {
      const url = await uploadDogPhoto(file, userId);
      if (url) {
        setGalleryPhotos((prev) => [...prev, url]);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeGalleryPhoto = (idx: number) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveGalleryPhoto = (from: number, to: number) => {
    if (to < 0 || to >= galleryPhotos.length) return;
    const arr = [...galleryPhotos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setGalleryPhotos(arr);
  };

  const shortSlug = dogId.replace(/-/g, "").substring(0, 8);
  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/g/${shortSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          <div>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Perfil Público</h2>
            <p className="text-[10px] text-zinc-400">{dogName}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl px-3 py-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
          <a
            href={`/guau/perro/${dogId}`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl px-3 py-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Vista previa
          </a>
        </div>
      </div>

      {/* Save indicator */}
      {saved && (
        <div className="animate-bounce text-center text-xs font-bold text-secondary-600 bg-secondary-50 rounded-full py-1 px-4 inline-flex items-center gap-1.5 mx-auto">
          <Check className="w-3.5 h-3.5" /> Guardado
        </div>
      )}

      {/* ═══ BIO ═══ */}
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" /> Biografía
        </h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={`Cuéntale al mundo sobre ${dogName}...`}
          maxLength={200}
          rows={3}
          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 resize-none focus:outline-none focus:border-primary-400 transition-colors"
        />
        <p className="text-[10px] text-zinc-400 text-right">{bio.length}/200</p>
      </div>

      {/* ═══ CITY ═══ */}
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ciudad</h3>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ej: Ciudad de México, CDMX"
          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      {/* ═══ SECTIONS TOGGLES ═══ */}
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Secciones visibles</h3>
        <p className="text-[10px] text-zinc-400 -mt-2">Activa o desactiva lo que quieres mostrar en el perfil público</p>
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <label
              key={s.key}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-primary-600">
                  {s.icon}
                </div>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.label}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sectionsVisible[s.key]}
                onClick={() => toggleSection(s.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  sectionsVisible[s.key] ? "bg-primary-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    sectionsVisible[s.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* ═══ GALLERY ═══ */}
      {sectionsVisible.gallery && (
        <div className="card-elevated rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-500" /> Galería de fotos
          </h3>
          <p className="text-[10px] text-zinc-400 -mt-2">
            {galleryPhotos.length}/{MAX_GALLERY} fotos · Arrastra para reordenar
          </p>

          <div className="grid grid-cols-4 gap-2">
            {galleryPhotos.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                <img src={url.replace(/ /g, "%20")} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {idx > 0 && (
                    <button onClick={() => moveGalleryPhoto(idx, idx - 1)} className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                      <GripVertical className="w-3.5 h-3.5 text-zinc-600" />
                    </button>
                  )}
                  <button onClick={() => removeGalleryPhoto(idx)} className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  {idx < galleryPhotos.length - 1 && (
                    <button onClick={() => moveGalleryPhoto(idx, idx + 1)} className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                      <GripVertical className="w-3.5 h-3.5 text-zinc-600 rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {galleryPhotos.length < MAX_GALLERY && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors gap-1">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-zinc-400" />
                    <span className="text-[9px] text-zinc-400">Agregar</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* ═══ BUSCA NOVI@ ═══ */}
      {sectionsVisible.breeding && (
        <div className="card-elevated rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" /> Busca Novi@
          </h3>

          <label className="flex items-center justify-between p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💘</span>
              <div>
                <p className="text-sm font-bold text-pink-700 dark:text-pink-300">Activar sección</p>
                <p className="text-[10px] text-pink-500/80">Se mostrará justo después de la biografía</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={breedingActive}
              onClick={() => setBreedingActive(!breedingActive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                breedingActive ? "bg-pink-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  breedingActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          {breedingActive && (
            <div className="space-y-3 pl-1">
              <div className="flex gap-3">
                <label className="flex-1">
                  <span className={`block text-[10px] font-bold mb-1.5 ${!breedingInquiryOnly ? "text-pink-600" : "text-zinc-400"}`}>
                    Mostrar precio
                  </span>
                  <button
                    type="button"
                    onClick={() => setBreedingInquiryOnly(false)}
                    className={`w-full rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                      !breedingInquiryOnly
                        ? "border-pink-400 bg-pink-50 text-pink-700"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    💰 Con precio
                  </button>
                </label>
                <label className="flex-1">
                  <span className={`block text-[10px] font-bold mb-1.5 ${breedingInquiryOnly ? "text-pink-600" : "text-zinc-400"}`}>
                    Solo consulta
                  </span>
                  <button
                    type="button"
                    onClick={() => setBreedingInquiryOnly(true)}
                    className={`w-full rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                      breedingInquiryOnly
                        ? "border-pink-400 bg-pink-50 text-pink-700"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    💬 Consulta al interno
                  </button>
                </label>
              </div>

              {!breedingInquiryOnly && (
                <div className="flex gap-2">
                  <select
                    value={breedingCurrency}
                    onChange={(e) => setBreedingCurrency(e.target.value)}
                    className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-pink-400"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={breedingAmount}
                    onChange={(e) => setBreedingAmount(e.target.value)}
                    placeholder="Monto"
                    className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
              )}

              <textarea
                value={breedingDescription}
                onChange={(e) => setBreedingDescription(e.target.value)}
                placeholder="Describe qué buscas, características, condiciones..."
                maxLength={200}
                rows={3}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 resize-none focus:outline-none focus:border-pink-400 transition-colors"
              />
              <p className="text-[10px] text-zinc-400 text-right">{breedingDescription.length}/200</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTACT ═══ */}
      {sectionsVisible.contact && (
        <div className="card-elevated rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-500" /> Datos de contacto públicos
          </h3>
          <p className="text-[10px] text-zinc-400 -mt-2">Esta información será visible para cualquiera que vea el perfil público</p>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">WhatsApp</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+52 1 55 1234 5678"
                className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
              {ownerWhatsapp && !contactPhone && (
                <button
                  type="button"
                  onClick={() => setContactPhone(ownerWhatsapp)}
                  className="text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl px-3 py-2 transition-colors whitespace-nowrap"
                >
                  Usar mi WhatsApp
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="dueño@email.com"
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ═══ PREVIEW LINK ═══ */}
      <div className="text-center pb-4">
        <a
          href={`/guau/perro/${dogId}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-colors shadow-xl shadow-primary-500/20"
        >
          <Eye className="w-4 h-4" />
          Ver perfil público de {dogName}
        </a>
      </div>
    </div>
  );
}
