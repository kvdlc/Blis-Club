"use client";

export const ACTIVE_APP_COOKIE = "blis_active_app_slug";
export const DEFAULT_APP_SLUG = "guau";

/** Lee la app activa desde localStorage (cliente). */
export function getActiveAppSlug(fallback: string = DEFAULT_APP_SLUG): string {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(ACTIVE_APP_COOKIE) || fallback;
  } catch {
    return fallback;
  }
}

/** Persiste la app activa en localStorage + cookie (para que el servidor también la lea). */
export function setActiveAppSlug(slug: string): void {
  try {
    localStorage.setItem(ACTIVE_APP_COOKIE, slug);
  } catch {
    /* noop */
  }
  try {
    document.cookie = `${ACTIVE_APP_COOKIE}=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    /* noop */
  }
}

/** Resuelve el id de la aplicación a partir del slug, usando el endpoint admin. */
export async function resolveApplicationId(slug: string): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/applications");
    if (!res.ok) return null;
    const json = await res.json();
    const app = (json.data || []).find((a: { slug: string }) => a.slug === slug);
    return app?.id ?? null;
  } catch {
    return null;
  }
}
