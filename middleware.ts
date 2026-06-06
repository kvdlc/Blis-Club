import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSecurityConfig } from "@/lib/security-config";
import { getCountryFromRequest, checkGeoBlock } from "@/lib/geoblock";
import { matchRateLimit, checkInMemory } from "@/lib/rate-limit";
import { injectHeaders } from "@/lib/security-headers";
import { logSecurityEvent } from "@/lib/access-logs";

const SUPABASE_TIMEOUT_MS = 2000;

// Cache simple en memoria para security config (5 min TTL)
let cachedSecConfig: Awaited<ReturnType<typeof getSecurityConfig>> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function getCachedSecurityConfig(): Promise<Awaited<ReturnType<typeof getSecurityConfig>>> {
  const now = Date.now();
  if (cachedSecConfig && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedSecConfig;
  }
  try {
    cachedSecConfig = await Promise.race([
      getSecurityConfig(),
      new Promise<typeof cachedSecConfig>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), SUPABASE_TIMEOUT_MS)
      ),
    ]);
    cacheTimestamp = now;
    return cachedSecConfig!;
  } catch {
    // Si falla, usar cache anterior si existe
    if (cachedSecConfig) return cachedSecConfig;
    return { geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null };
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIP(request);
  const ua = request.headers.get("user-agent") || "";

  const isAuthCallback = path.startsWith("/auth/callback");
  const isAppRoute = path.startsWith("/guau/app");
  const isAdminRoute = path.startsWith("/superadmin");
  const isProtected = isAppRoute || isAdminRoute;

  // ═══════════════════════════════════════════
  // 1. PUBLIC ROUTE PASS-THROUGH (no auth, no security config)
  // ═══════════════════════════════════════════
  if (isAuthCallback) return supabaseResponse;

  const authCookie = request.cookies.get("sb-access-token") || request.cookies.get("sb-refresh-token");

  if (!isProtected && !authCookie) {
    return supabaseResponse;
  }

  // ═══════════════════════════════════════════
  // 2. SECURITY: Cargar config (solo para rutas protegidas)
  // ═══════════════════════════════════════════
  let secConfig: Awaited<ReturnType<typeof getSecurityConfig>> = {
    geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null,
  };

  if (isProtected) {
    secConfig = await getCachedSecurityConfig();
  }

  // ═══════════════════════════════════════════
  // 3. GEOBLOCK (solo rutas protegidas)
  // ═══════════════════════════════════════════
  if (isProtected) {
    const country = getCountryFromRequest(request);
    if (country) {
      const geoResult = checkGeoBlock(country, secConfig.geobloqueo);
      if (geoResult.blocked) {
        logSecurityEvent({ ip, pais: geoResult.country || country, ruta: path, metodo: method, motivo: "geobloqueo", user_agent: ua });
        return new NextResponse(secConfig.geobloqueo?.mensaje_bloqueo || "Acceso denegado", { status: 403 });
      }
    }

    if (secConfig.rate_limiting) {
      const matchedRule = matchRateLimit(secConfig.rate_limiting, path, method);
      if (matchedRule) {
        const result = checkInMemory(ip, path, method, matchedRule.limite, matchedRule.ventana_segundos);
        if (!result.allowed) {
          logSecurityEvent({ ip, pais: "", ruta: path, metodo: method, motivo: "rate_limit", user_agent: ua });
          return new NextResponse(secConfig.rate_limiting.mensaje_limite, { status: 429, headers: { "Retry-After": String(Math.ceil(result.resetMs / 1000)) } });
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // 4. AUTH CHECK
  // ═══════════════════════════════════════════
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ═══════════════════════════════════════════
  // 5. ADMIN ROLE CHECK
  // ═══════════════════════════════════════════
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    if (role !== "admin" && role !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = "/guau/app";
      return NextResponse.redirect(url);
    }
  }

  // ═══════════════════════════════════════════
  // 6. USER LOGIN ROUTING
  // ═══════════════════════════════════════════
  if (user && path === "/") {
    // Multi-app: check user_apps for routing
    const { data: userApps } = await supabase
      .from("user_apps")
      .select("app_slug")
      .eq("user_id", user.id);

    if (userApps && userApps.length === 1) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userApps[0].app_slug}/app`;
      return NextResponse.redirect(url);
    }
  }

  // ═══════════════════════════════════════════
  // 7. SECURITY HEADERS (after everything)
  // ═══════════════════════════════════════════
  if (secConfig.security_headers) {
    injectHeaders(supabaseResponse, secConfig.security_headers);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
