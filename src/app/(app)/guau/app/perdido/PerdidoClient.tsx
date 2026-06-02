"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import { QRCollar } from "./QRCollar";
import { PanicButton } from "./PanicButton";
import { PosterEditor } from "./PosterEditor";
import { AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  dog: Dog;
  latestWeightPhoto: string | null;
}

export function PerdidoClient({ dog: initialDog, latestWeightPhoto }: Props) {
  const router = useRouter();
  const [dog, setDog] = useState(initialDog);
  const [loading, setLoading] = useState(false);

  const isLost = (dog as Dog & { is_lost?: boolean }).is_lost === true;
  const posterPhotoUrl = (dog as Dog & { poster_photo_url?: string | null }).poster_photo_url || latestWeightPhoto || dog.foto_url;

  const handlePanicSubmit = useCallback(async (fields: {
    lost_location: string;
    lost_notes: string;
    poster_contact: string;
    poster_reward_amount: string;
  }) => {
    setLoading(true);
    const supabase = createClient();
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
    const supabase = createClient();
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
    const supabase = createClient();
    await supabase.from("dogs").update(fields).eq("id", dog.id);
    setDog({ ...dog, ...fields } as Dog);
  }, [dog]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/guau/app" className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Perro Perdido</h1>
      </div>

      {/* Emergency banner */}
      {isLost && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400">
              {dog.nombre} está reportado como perdido
            </p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
              {dog.lost_since ? `Desde el ${new Date((dog as Dog & { lost_since: string }).lost_since!).toLocaleDateString("es-AR")}` : ""}
            </p>
            <button
              onClick={handleMarkFound}
              disabled={loading}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-3 py-1.5 rounded-full hover:bg-green-200 dark:hover:bg-green-950/70 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar como encontrado
            </button>
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
