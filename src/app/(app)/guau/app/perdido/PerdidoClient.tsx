"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureShortLink, getShortUrl } from "@/lib/shorten";
import type { Dog } from "@/types/database";
import { QRCollar } from "./QRCollar";
import { PanicButton } from "./PanicButton";
import { PosterEditor } from "./PosterEditor";
import { AlertTriangle, CheckCircle, ArrowLeft, Share2, Copy, Check } from "lucide-react";

interface LostDog extends Dog {
  is_lost?: boolean;
  lost_since?: string | null;
  poster_photo_url?: string | null;
  lost_location?: string | null;
  lost_notes?: string | null;
  poster_contact?: string | null;
  poster_reward_amount?: string | null;
}

interface Props {
  dog: Dog;
  latestWeightPhoto: string | null;
}

export function PerdidoClient({ dog: initialDog, latestWeightPhoto }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [dog, setDog] = useState(initialDog);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shortSlug, setShortSlug] = useState<string | null>(null);

  const lostDog = dog as LostDog;
  const isLost = lostDog.is_lost === true;
  const posterPhotoUrl = lostDog.poster_photo_url || latestWeightPhoto || dog.foto_url;
  const profileUrl = shortSlug ? getShortUrl(shortSlug) : (typeof window !== "undefined" ? `${window.location.origin}/guau/perro/${dog.id}` : "");

  // Ensure short link exists
  useState(() => {
    ensureShortLink(dog.id).then(setShortSlug).catch(() => {});
  });

  const handlePanicSubmit = useCallback(async (fields: {
    lost_location: string;
    lost_notes: string;
    poster_contact: string;
    poster_reward_amount: string;
  }) => {
    setLoading(true);
    const { error } = await supabase
      .from("dogs")
      .update({
        is_lost: true,
        lost_since: new Date().toISOString(),
        lost_location: fields.lost_location || null,
        lost_notes: fields.lost_notes || null,
        poster_contact: fields.poster_contact || null,
        poster_reward_amount: fields.poster_reward_amount || null,
      })
      .eq("id", dog.id);

    if (!error) {
      setDog({ ...dog, ...fields, is_lost: true, lost_since: new Date().toISOString() } as Dog);
    }
    setLoading(false);
    router.refresh();
  }, [dog, router]);

  const handleMarkFound = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase
      .from("dogs")
      .update({ is_lost: false, lost_since: null })
      .eq("id", dog.id);

    if (!error) {
      setDog({ ...dog, is_lost: false, lost_since: null } as Dog);
    }
    setLoading(false);
    router.refresh();
  }, [dog, router]);

  const handlePosterFieldsUpdate = useCallback(async (fields: Record<string, string>) => {
    await supabase.from("dogs").update(fields).eq("id", dog.id);
    setDog({ ...dog, ...fields } as Dog);
  }, [dog]);

  const handleCopyLink = async () => {
    const url = shortSlug ? getShortUrl(shortSlug) : `${window.location.origin}/guau/perro/${dog.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const url = shortSlug ? getShortUrl(shortSlug) : `${window.location.origin}/guau/perro/${dog.id}`;
    const sinceStr = lostDog.lost_since ? `Perdido desde el ${new Date(lostDog.lost_since).toLocaleDateString("es")}` : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dog.nombre} está perdido`,
          text: `Ayúdame a encontrar a ${dog.nombre}. ${sinceStr}`,
          url,
        });
      } catch {}
    } else {
      await handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.replace("/guau/app", { scroll: false })} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Perro Perdido</h1>
      </div>

      {/* Emergency banner */}
      {isLost && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-700 dark:text-red-400">
              {dog.nombre} está reportado como perdido
            </p>
            {lostDog.lost_since && (
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                Desde el {new Date(lostDog.lost_since).toLocaleDateString("es")}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-950/40 px-3 py-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-950/70 transition-colors"
              >
                {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar enlace</>}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-950/70 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Compartir
              </button>
              <button
                onClick={handleMarkFound}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-3 py-1.5 rounded-full hover:bg-green-200 dark:hover:bg-green-950/70 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como encontrado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content: preventive vs emergency */}
      {isLost ? (
        <PosterEditor
          dog={dog}
          posterPhotoUrl={posterPhotoUrl || undefined}
          onFieldsUpdate={handlePosterFieldsUpdate}
        />
      ) : (
        <div className="space-y-4">
          <QRCollar dogId={dog.id} dogName={dog.nombre} />
          <PanicButton dogName={dog.nombre} onSubmit={handlePanicSubmit} loading={loading} />
        </div>
      )}
    </div>
  );
}