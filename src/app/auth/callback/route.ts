import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/guau/app";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Si hay código de referido en la URL, guardarlo en cookie antes de redirigir
      const response = NextResponse.redirect(`${origin}${next}`);
      if (ref) {
        const expires = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toUTCString();
        response.headers.set(
          "Set-Cookie",
          `blis_referral_code=${ref};expires=${expires};path=/;SameSite=Lax`
        );
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
}
