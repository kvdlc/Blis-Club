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

export async function uploadAutoPhoto(file: File, vehicleId: string): Promise<string | null> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { data, error } = await supabase.storage
    .from("auto-photos")
    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload auto photo error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("auto-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadMarketplacePhoto(file: File, listingId: string): Promise<string | null> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const fileName = `marketplace/${listingId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;

  const { data, error } = await supabase.storage
    .from("auto-photos")
    .upload(fileName, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload marketplace photo error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("auto-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadDocumentPhoto(file: File, vehicleId: string): Promise<string | null> {
  const supabase = createClient();
  let blob: Blob;
  let contentType: string;
  try {
    blob = await compressImage(file);
    contentType = blob.type || file.type || "image/jpeg";
  } catch {
    blob = file;
    contentType = file.type || "image/jpeg";
  }
  const ext = contentType.includes("png") ? "png" : "jpg";
  const fileName = `documentos/${vehicleId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("auto-photos")
    .upload(fileName, blob, { upsert: true, contentType });

  if (error) {
    console.error("Upload document photo error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("auto-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

/** Kids Club: subir un recurso (lámina, portada, dibujo del niño) por archivo. */
export async function uploadKidsAsset(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  let blob: Blob = file;
  try {
    blob = await compressImage(file);
  } catch {
    blob = file;
  }
  const contentType = blob.type || file.type || "image/jpeg";
  const ext = contentType.includes("pdf")
    ? "pdf"
    : contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("kids-assets")
    .upload(fileName, blob, { upsert: true, contentType });

  if (error) {
    console.error("Upload kids asset error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("kids-assets").getPublicUrl(data.path);
  return urlData.publicUrl;
}

/** Kids Club: subir un dibujo/coloreado creado en canvas (dataURL → bucket). */
export async function uploadKidsDataUrl(
  dataUrl: string,
  userId: string,
  prefix = "dibujo",
): Promise<string | null> {
  const supabase = createClient();
  const base64 = dataUrl.split(",")[1];
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const isPng = dataUrl.startsWith("data:image/png");
  const blob = new Blob([ab], { type: isPng ? "image/png" : "image/jpeg" });

  const ext = isPng ? "png" : "jpg";
  const fileName = `${userId}/${prefix}-${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("kids-assets")
    .upload(fileName, blob, { upsert: true, contentType: blob.type });

  if (error) {
    console.error("Upload kids dataUrl error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("kids-assets").getPublicUrl(data.path);
  return urlData.publicUrl;
}

/** Foto del taller/contacto (Guantera → Directorio). Subida por archivo. */
export async function uploadContactPhoto(file: File, vehicleId: string): Promise<string | null> {
  const supabase = createClient();
  let blob: Blob;
  let contentType: string;
  try {
    blob = await compressImage(file);
    contentType = blob.type || file.type || "image/jpeg";
  } catch {
    blob = file;
    contentType = file.type || "image/jpeg";
  }
  const ext = contentType.includes("png") ? "png" : "jpg";
  const fileName = `contactos/${vehicleId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("auto-photos")
    .upload(fileName, blob, { upsert: true, contentType });

  if (error) {
    console.error("Upload contact photo error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("auto-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

/** Fotos del repuesto/accesorio comprado (Bitácora → Repuestos). Subida por archivo. */
export async function uploadUpgradePhoto(file: File, vehicleId: string): Promise<string | null> {
  const supabase = createClient();
  let blob: Blob;
  let contentType: string;
  try {
    blob = await compressImage(file);
    contentType = blob.type || file.type || "image/jpeg";
  } catch {
    blob = file;
    contentType = file.type || "image/jpeg";
  }
  const ext = contentType.includes("png") ? "png" : "jpg";
  const fileName = `repuestos/${vehicleId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("auto-photos")
    .upload(fileName, blob, { upsert: true, contentType });

  if (error) {
    console.error("Upload upgrade photo error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("auto-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}
