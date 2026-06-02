"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { toPng } from "html-to-image";
import { PosterCanvas } from "./PosterCanvas";
import { POSTER_FIELDS } from "@/lib/poster";
import { ensureShortLink, getShortUrl } from "@/lib/shorten";
import { createClient } from "@/lib/supabase/client";
import { Download, Share2, Camera, Loader2 } from "lucide-react";
import type { Dog } from "@/types/database";

interface LostDog extends Dog {
  is_lost?: boolean;
  lost_since?: string | null;
  lost_location?: string | null;
  lost_notes?: string | null;
  poster_title?: string | null;
  poster_photo_url?: string | null;
  poster_contact?: string | null;
  poster_reward_amount?: string | null;
}

interface Props {
  dog: LostDog;
  posterPhotoUrl?: string | null;
  onFieldsUpdate: (fields: Record<string, string>) => void;
}

export function PosterEditor({ dog, posterPhotoUrl, onFieldsUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [posterTitle, setPosterTitle] = useState(dog.poster_title || POSTER_FIELDS.poster_title.default);
  const [lostLocation, setLostLocation] = useState(dog.lost_location || "");
  const [lostNotes, setLostNotes] = useState(dog.lost_notes || "");
  const [posterContact, setPosterContact] = useState(dog.poster_contact || "");
  const [posterReward, setPosterReward] = useState(dog.poster_reward_amount || "");
  const [photoUrl, setPhotoUrl] = useState(dog.poster_photo_url || posterPhotoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shortSlug, setShortSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const profileUrl = mounted
    ? (shortSlug ? getShortUrl(shortSlug) : `${window.location.origin}/guau/perro/${dog.id}`)
    : "";

  // Ensure short link exists
  useEffect(() => {
    ensureShortLink(dog.id).then(setShortSlug);
  }, [dog.id]);

  // Preview scaling
  const previewOuterRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.3);
  const [innerHeight, setInnerHeight] = useState(600);
  const [userZoom, setUserZoom] = useState(1);

  useEffect(() => {
    const outer = previewOuterRef.current;
    if (!outer) return;
    const update = () => {
      const w = outer.clientWidth - 40;
      setPreviewScale(Math.min(1, Math.max(0.12, w / 2480)));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(outer);
    return () => obs.disconnect();
  }, []);

  useLayoutEffect(() => {
    const inner = previewInnerRef.current;
    if (inner) {
      setInnerHeight(inner.scrollHeight);
    }
  }, [posterTitle, lostLocation, lostNotes, posterContact, posterReward, photoUrl, shortSlug, mounted, profileUrl]);

  const persist = useCallback((key: string, value: string) => {
    onFieldsUpdate({ [key]: value });
  }, [onFieldsUpdate]);

  const posterFields = {
    poster_title: posterTitle,
    nombre: dog.nombre,
    raza: dog.raza,
    peso_kg: `${dog.peso_kg}`,
    lost_location: lostLocation,
    lost_notes: lostNotes,
    poster_contact: posterContact,
    poster_reward_amount: posterReward,
    photoUrl: photoUrl || posterPhotoUrl || "",
    profileUrl,
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fileName = `posters/${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { data, error } = await supabase.storage
      .from("dog-photos")
      .upload(fileName, file, { upsert: true, contentType: file.type || "image/jpeg" });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from("dog-photos").getPublicUrl(data.path);
      const url = urlData.publicUrl;
      setPhotoUrl(url);
      persist("poster_photo_url", url);
    }
    setUploading(false);
  };

  const handleDownload = async () => {
    const node = document.getElementById("poster-canvas");
    if (!node) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `afiche-perdido-${dog.nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    }
    setDownloading(false);
  };

  const handleShareWhatsApp = () => {
    const url = shortSlug ? getShortUrl(shortSlug) : profileUrl;
    const text = encodeURIComponent(
      `🚨 PERRO PERDIDO - ${dog.nombre}\n\n` +
      `${dog.raza} · ${dog.peso_kg} kg\n` +
      `${lostLocation ? `📍 Última vez visto: ${lostLocation}\n` : ""}` +
      `${lostNotes ? `📝 ${lostNotes}\n` : ""}` +
      `${posterContact ? `📞 Contacto: ${posterContact}\n` : ""}` +
      `${posterReward ? `💰 Recompensa: ${posterReward}\n` : ""}` +
      `\nPerfil completo: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = shortSlug ? getShortUrl(shortSlug) : profileUrl;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Editable fields */}
      <div className="card-soft rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🎨</span>
          <h2 className="font-bold text-zinc-800 dark:text-zinc-200">Editar Afiche</h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
            Campos vacíos no se muestran
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {POSTER_FIELDS.poster_title.label}
            <span className="text-zinc-300 dark:text-zinc-600 ml-1">
              ({posterTitle.length}/{POSTER_FIELDS.poster_title.max})
            </span>
          </label>
          <input
            type="text"
            maxLength={POSTER_FIELDS.poster_title.max}
            value={posterTitle}
            onChange={(e) => { setPosterTitle(e.target.value); persist("poster_title", e.target.value); }}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40"
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Foto para el afiche
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploading ? "Subiendo..." : photoUrl ? "Cambiar foto" : "Subir foto"}
            </button>
            {photoUrl && (
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary-200 dark:border-primary-800">
                <img src={photoUrl.replace(/ /g, "%20")} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="text-xs text-zinc-400">
              {photoUrl ? "Foto cargada" : "Sin foto (se usará la de perfil)"}
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {POSTER_FIELDS.lost_location.label}
            <span className="text-zinc-300 dark:text-zinc-600 ml-1">
              ({lostLocation.length}/{POSTER_FIELDS.lost_location.max})
            </span>
          </label>
          <input
            type="text"
            maxLength={POSTER_FIELDS.lost_location.max}
            placeholder={POSTER_FIELDS.lost_location.placeholder}
            value={lostLocation}
            onChange={(e) => { setLostLocation(e.target.value); persist("lost_location", e.target.value); }}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {POSTER_FIELDS.lost_notes.label}
            <span className="text-zinc-300 dark:text-zinc-600 ml-1">
              ({lostNotes.length}/{POSTER_FIELDS.lost_notes.max})
            </span>
          </label>
          <textarea
            rows={3}
            maxLength={POSTER_FIELDS.lost_notes.max}
            placeholder={POSTER_FIELDS.lost_notes.placeholder}
            value={lostNotes}
            onChange={(e) => { setLostNotes(e.target.value); persist("lost_notes", e.target.value); }}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40 resize-none"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {POSTER_FIELDS.poster_contact.label}
            <span className="text-zinc-300 dark:text-zinc-600 ml-1">
              ({posterContact.length}/{POSTER_FIELDS.poster_contact.max})
            </span>
          </label>
          <input
            type="text"
            maxLength={POSTER_FIELDS.poster_contact.max}
            placeholder={POSTER_FIELDS.poster_contact.placeholder}
            value={posterContact}
            onChange={(e) => { setPosterContact(e.target.value); persist("poster_contact", e.target.value); }}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40"
          />
        </div>

        {/* Reward */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {POSTER_FIELDS.poster_reward_amount.label}
            <span className="text-zinc-300 dark:text-zinc-600 ml-1">
              ({posterReward.length}/{POSTER_FIELDS.poster_reward_amount.max})
            </span>
          </label>
          <input
            type="text"
            maxLength={POSTER_FIELDS.poster_reward_amount.max}
            placeholder={POSTER_FIELDS.poster_reward_amount.placeholder}
            value={posterReward}
            onChange={(e) => { setPosterReward(e.target.value); persist("poster_reward_amount", e.target.value); }}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="card-soft rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <span>👁️</span> Vista previa (A4)
          </h2>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setUserZoom((z) => Math.max(0.25, +(z * 0.8).toFixed(2)))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors text-sm font-bold"
              title="Alejar"
            >
              −
            </button>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 w-12 text-center">
              {Math.round(userZoom * 100)}%
            </span>
            <button
              onClick={() => setUserZoom((z) => Math.min(3, +(z * 1.25).toFixed(2)))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors text-sm font-bold"
              title="Acercar"
            >
              +
            </button>
            <button
              onClick={() => setUserZoom(1)}
              className="h-8 px-2 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors text-xs font-bold"
              title="Ajustar a pantalla"
            >
              Ajustar
            </button>
          </div>
        </div>

        <div
          ref={previewOuterRef}
          className="overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
          style={{ maxHeight: "80vh" }}
        >
          <div
            style={{
              width: 2480 * previewScale * userZoom,
              height: innerHeight * previewScale * userZoom,
              overflow: "hidden",
            }}
          >
            <div
              ref={previewInnerRef}
              style={{
                width: 2480,
                transform: `scale(${previewScale * userZoom})`,
                transformOrigin: "0 0",
              }}
            >
              <PosterCanvas fields={posterFields} id="poster-canvas" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-green-600 text-white text-base font-bold hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-green-600/20"
          >
            <Download className="w-5 h-5" />
            {downloading ? "Generando afiche..." : "Descargar afiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
