import { NextResponse, type NextRequest } from "next/server";

/**
 * Expone el pathname actual en la cabecera `x-pathname` para que los layouts
 * del servidor puedan evitar redirigir a una ruta que ya están renderizando
 * (evita el bucle infinito en /app/suscripcion cuando el trial venció).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/auto/app/:path*", "/guau/app/:path*", "/Spartan/app/:path*"],
};
