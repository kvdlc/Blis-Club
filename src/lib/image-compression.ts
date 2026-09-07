const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 0.75;
const MAX_SIZE_BYTES = 100 * 1024;

type Drawable = ImageBitmap | HTMLImageElement;

/** Carga la imagen de forma compatible: createImageBitmap y, si falla (HEIC, Safari), <img> con objectURL. */
async function loadDrawable(file: File): Promise<Drawable> {
  // createImageBitmap es rápido pero no soporta todos los formatos de cámara
  try {
    return await createImageBitmap(file);
  } catch {
    // fallback: decodificar vía <img> (soporta HEIC en iOS Safari)
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo decodificar la imagen")); };
      img.src = url;
    });
  }
}

function drawableSize(d: Drawable): { width: number; height: number } {
  if (d instanceof HTMLImageElement) return { width: d.naturalWidth, height: d.naturalHeight };
  return { width: d.width, height: d.height };
}

export async function compressImage(file: File): Promise<Blob> {
  // Si por cualquier razón no se puede procesar, se sube el archivo original sin romper el flujo
  try {
    const drawable = await loadDrawable(file);
    let { width, height } = drawableSize(drawable);

    if (width === 0 || height === 0) return file;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(drawable, 0, 0, width, height);
    if ("close" in drawable) drawable.close();

    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > MAX_SIZE_BYTES && quality > 0.3) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > 0) return blob;
    return file;
  } catch {
    return file;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b || new Blob([], { type: "image/jpeg" })),
      "image/jpeg",
      quality,
    );
  });
}
