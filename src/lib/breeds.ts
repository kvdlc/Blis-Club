"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface BreedImage {
  image_url: string;
  variant: string;
}

const cached: Record<string, BreedImage[]> = {};

export function useBreedImages(breed: string): BreedImage[] {
  const [images, setImages] = useState<BreedImage[]>(cached[breed] || []);

  useEffect(() => {
    if (!breed) return;
    if (cached[breed]) {
      setImages(cached[breed]);
      return;
    }
    const supabase = createClient();
    // Try exact match first
    supabase.from("breed_images").select("image_url, variant, breed_name").eq("breed_name", breed).order("variant")
      .then(({ data }) => {
        const imgs = (data as (BreedImage & { breed_name: string })[] | null) ?? [];
        if (imgs.length > 0) {
          cached[breed] = imgs;
          setImages(imgs);
          return;
        }
        // Fallback: fetch all and do partial match
        supabase.from("breed_images").select("image_url, variant, breed_name").then(({ data: all }) => {
          const allBreeds = (all as (BreedImage & { breed_name: string })[] | null) ?? [];
          const matches = allBreeds.filter((b) =>
            b.breed_name?.toLowerCase().includes(breed.toLowerCase())
          );
          cached[breed] = matches;
          setImages(matches);
        });
      });
  }, [breed]);

  return images;
}

export function useBreedImage(breed: string, variant?: string): string | null {
  const images = useBreedImages(breed);
  if (!images.length) return null;
  if (variant) return images.find((i) => i.variant === variant)?.image_url || images[0].image_url;
  return images[0].image_url;
}
