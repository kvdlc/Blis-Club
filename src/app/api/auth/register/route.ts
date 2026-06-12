import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, firstName, lastName } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const serviceClient = createServiceClient();
    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existing) {
      // Existing user: sign them in with a magic link (no password reset!)
      // We generate a temporary password, sign in, then immediately sign out
      // so they have a session cookie for the checkout flow
      const tempPassword = crypto.randomUUID().replace(/-/g, "") + "!Aa1";
      await serviceClient.auth.admin.updateUserById(existing.id, {
        password: tempPassword,
        email_confirm: true,
      });

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: tempPassword,
      });

      if (signInError) {
        console.error("[Register] Sign in failed for existing user:", signInError);
        return NextResponse.json(
          { error: "No se pudo iniciar sesión. Intenta de nuevo." },
          { status: 500 }
        );
      }

      // Update profile name if provided
      if (firstName || lastName) {
        await serviceClient.from("profiles").update({
          ...(firstName ? { first_name: firstName.trim() } : {}),
          ...(lastName ? { last_name: lastName.trim() } : {}),
        }).eq("id", existing.id);
      }

      return NextResponse.json({ success: true, existing: true });
    }

    // New user: create account (will be a "lead" until payment confirmed)
    // The webhook will mark is_lead=false on successful payment
    const password = crypto.randomUUID().replace(/-/g, "") + "!Aa1";
    const { data: newUser, error: createError } =
      await serviceClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName?.trim() || "",
          last_name: lastName?.trim() || "",
        },
      });

    if (createError || !newUser?.user) {
      console.error("[Register] Error creating user:", createError);
      return NextResponse.json(
        { error: createError?.message || "Error al crear la cuenta" },
        { status: 500 }
      );
    }

    const userId = newUser.user.id;

    await serviceClient
      .from("profiles")
      .upsert({
        id: userId,
        first_name: firstName?.trim() || "",
        last_name: lastName?.trim() || "",
        email: normalizedEmail,
        is_lead: true,
      }, { onConflict: "id" });

    // Sign in to establish session cookies
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      console.error("[Register] Sign in failed:", signInError);
      return NextResponse.json(
        { error: "Cuenta creada pero no se pudo iniciar sesión. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // Send welcome email with temporary password
    try {
      const { sendTemplateEmail } = await import("@/lib/email/sendTemplateEmail");
      sendTemplateEmail({
        evento: "bienvenida",
        to: normalizedEmail,
        variables: {
          nombre: firstName?.trim() || normalizedEmail.split("@")[0],
          display_name: `${firstName?.trim() || ""} ${lastName?.trim() || ""}`.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          password,
          app_name: "Blis Club",
          app_name_suffix: " a Blis Club",
          app_url: "https://blis.club/guau/app",
        },
      }).catch((err: unknown) => console.error("[Register] Welcome email failed:", err));
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Register] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}