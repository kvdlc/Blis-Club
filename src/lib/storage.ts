import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compression";

export async function uploadDogPhoto(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { data, error } = await supabase.storage
    .from("dog-photos")
    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("dog-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadPhotoFromDataUrl(dataUrl: string, userId: string): Promise<string | null> {
  const supabase = createClient();
  const base64 = dataUrl.split(",")[1];
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: "image/jpeg" });

  const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
  const compressed = await compressImage(file);

  const fileName = `${userId}/editor-${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from("dog-photos")
    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload dataUrl error:", error.message);
    return null;
  }

  const { data: urlData } = await supabase.storage.from("dog-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadRecipeImage(dataUrl: string, recipeId: string): Promise<string | null> {
  const supabase = createClient();
  const base64 = dataUrl.split(",")[1];
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: "image/jpeg" });

  const file = new File([blob], "recipe.jpg", { type: "image/jpeg" });
  const compressed = await compressImage(file);

  const fileName = `${recipeId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload recipe image error:", error.message);
    return null;
  }

  const { data: urlData } = await supabase.storage.from("recipe-images").getPublicUrl(data.path);
  return urlData.publicUrl;
}
