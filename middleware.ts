import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSecurityConfig } from "@/lib/security-config";
import { getCountryFromRequest, checkGeoBlock } from "@/lib/geoblock";
import { matchRateLimit, checkInMemory } from "@/lib/rate-limit";
import { injectHeaders } from "@/lib/security-headers";
import { checkAlerts, dispatchAlerts } from "@/lib/security-alerts";
import { logSecurityEvent } from "@/lib/access-logs";

const SUPABASE_TIMEOUT_MS = 3000;

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

  // ═══════════════════════════════════════════
  // 1. SECURITY: Cargar config (con timeout)
  // ═══════════════════════════════════════════
  let secConfig: Awaited<ReturnType<typeof getSecurityConfig>>;
  try {
    secConfig = await Promise.race([
      getSecurityConfig(),
      new Promise<ReturnType<typeof getSecurityConfig>>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), SUPABASE_TIMEOUT_MS)
      ),
    ]);
  } catch {
    secConfig = { geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null };
  }

  // ═══════════════════════════════════════════
  // 2. GEOBLOCK (always runs, fallback hardcoded if no DB config)
  // ═══════════════════════════════════════════
  const country = getCountryFromRequest(request);
  if (country) {
    const geoResult = checkGeoBlock(country, secConfig.geobloqueo);
    if (geoResult.blocked) {
      logSecurityEvent({
        ip,
        pais: geoResult.country || country,
        ruta: path,
        metodo: method,
        motivo: "geobloqueo",
        user_agent: ua,
      });

      if (secConfig.alerts) {
        const disparos = checkAlerts("geobloqueo", geoResult.country || country, ip, path, secConfig.alerts);
        if (disparos) dispatchAlerts(disparos, secConfig.alerts);
      }

      const msg = secConfig.geobloqueo?.mensaje_bloqueo || "Acceso denegado desde tu ubicación";
      return new NextResponse(msg, { status: 403 });
    }
  }

  // ═══════════════════════════════════════════
  // 3. RATE LIMITING
  // ═══════════════════════════════════════════
  if (secConfig.rate_limiting) {
    const matchedRule = matchRateLimit(secConfig.rate_limiting, path, method);
    if (matchedRule) {
      const result = checkInMemory(ip, path, method, matchedRule.limite, matchedRule.ventana_segundos);
      if (!result.allowed) {
        logSecurityEvent({
          ip,
          pais: "",
          ruta: path,
          metodo: method,
          motivo: "rate_limit",
          user_agent: ua,
        });

        if (secConfig.alerts) {
          const disparos = checkAlerts("rate_limit", "", ip, path, secConfig.alerts);
          if (disparos) dispatchAlerts(disparos, secConfig.alerts);
        }

        return new NextResponse(secConfig.rate_limiting.mensaje_limite, {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(result.resetMs / 1000)) },
        });
      }
    }
  }

  // ═══════════════════════════════════════════
  // 4. AUTH CHECK
  // ═══════════════════════════════════════════
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthCallback = path.startsWith("/auth/callback");
  const isAppRoute = path.startsWith("/guau/app");
  const isAdminRoute = path.startsWith("/superadmin");

  if (isAuthCallback) {
    if (secConfig.security_headers) {
      injectHeaders(supabaseResponse, secConfig.security_headers);
    }
    return supabaseResponse;
  }

  if (!user && (isAppRoute || isAdminRoute)) {
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
