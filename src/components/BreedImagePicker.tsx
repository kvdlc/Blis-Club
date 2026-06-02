"use client";

import { useBreedImages } from "@/lib/breeds";
import { Check } from "lucide-react";

interface Props {
  breed: string;
  selected: string | null;
  onSelect: (url: string) => void;
}

export function BreedImagePicker({ breed, selected, onSelect }: Props) {
  const images = useBreedImages(breed);

  if (images.length === 0) return null;

  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-2">Imagen de perfil de {breed}</label>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img) => (
          <button
            key={img.image_url}
            onClick={() => onSelect(img.image_url)}
            className={`shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all active:scale-95 ${
              selected === img.image_url
                ? "border-primary-500 shadow-md ring-2 ring-primary-200"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <img src={img.image_url} alt={img.variant} className="w-full h-full object-cover object-center" />
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">
        {images.length} {images.length > 1 ? "variantes disponibles" : "variante disponible"}
      </p>
    </div>
  );
}
