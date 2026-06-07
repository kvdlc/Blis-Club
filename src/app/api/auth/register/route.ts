import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendTemplateEmail } from "@/lib/email/sendTemplateEmail";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  const length = 16;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, firstName, lastName, sourceApp } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      sourceApp?: string;
    };

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, nombre y apellido son requeridos" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const password = generatePassword();

    const serviceClient = createServiceClient();

    // Intentar crear el usuario (si ya existe, actualizar contraseña)
    let userId: string;

    const { data: existingUsers, error: lookupError } = await serviceClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existing) {
      userId = existing.id;
      // Usuario existente: solo actualizar metadata, NO tocar password
      await serviceClient.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        user_metadata: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });

      // Actualizar profiles (actualizar source_app si viene)
      const updateData: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };
      if (sourceApp) updateData.source_app = sourceApp;
      await serviceClient
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      return NextResponse.json({
        success: true,
        existing: true,
        message: "Ya tienes una cuenta. Por favor inicia sesión para continuar.",
      });
    }

    // Crear nuevo usuario
    const { data: newUser, error: createError } =
      await serviceClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });

    if (createError || !newUser?.user) {
      console.error("[Register] Error creating user:", createError);
      return NextResponse.json(
        { error: createError?.message || "Error al crear la cuenta" },
        { status: 500 }
      );
    }

    userId = newUser.user.id;

    // Actualizar profiles con nombre, apellido, source_app. is_lead = false por defecto.
    await serviceClient
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_lead: false,
        source_app: sourceApp || null,
      })
      .eq("id", userId);

    // Sign in para establecer cookies de sesión
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      console.error("[Register] Sign in failed:", signInError);
      return NextResponse.json(
        {
          error:
            "Cuenta creada pero no se pudo iniciar sesión. Intenta de nuevo.",
        },
        { status: 500 }
      );
    }

    // Enviar email de bienvenida con contraseña temporal (solo nuevos usuarios)
    sendTemplateEmail({
      evento: "bienvenida",
      to: normalizedEmail,
      variables: {
        nombre: firstName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`,
        email: normalizedEmail,
        password,
      },
    }).catch((err) => console.error("[Register] Welcome email failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Register] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
