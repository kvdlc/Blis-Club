export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Relleno por inundación con tolerancia, para láminas raster (línea). */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  hex: string,
  tolerance = 48,
) {
  const { width, height } = ctx.canvas;
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const start = (sy * width + sx) * 4;
  const tr = d[start], tg = d[start + 1], tb = d[start + 2];
  const [nr, ng, nb] = hexToRgb(hex);
  if (Math.abs(tr - nr) < 6 && Math.abs(tg - ng) < 6 && Math.abs(tb - nb) < 6) return;

  const visited = new Uint8Array(width * height);
  const stack: number[] = [sx, sy];
  const tol2 = tolerance * tolerance * 3;

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = y * width + x;
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    const dr = d[i] - tr, dg = d[i + 1] - tg, db = d[i + 2] - tb;
    if (dr * dr + dg * dg + db * db > tol2) continue;
    d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; d[i + 3] = 255;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  ctx.putImageData(img, 0, 0);
}
