import { NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email/sendTemplateEmail";

export async function POST(request: Request) {
  try {
    const { to, evento } = await request.json();

    if (!to || !evento) {
      return NextResponse.json({ error: "to y evento son requeridos" }, { status: 400 });
    }

    const variables: Record<string, string> = {
      nombre: "Usuario de Prueba",
      display_name: "Usuario de Prueba",
      email: to,
    };

    if (evento === "bienvenida") {
      variables.password = "contrasena-de-prueba-123";
    }
    if (evento === "pago_confirmado") {
      variables.monto = "$1.00";
      variables.plan = "Trimestral";
    }
    if (evento === "commission_available") {
      variables.monto = "$0.25";
      variables.referido = "perro@example.com";
    }

    const result = await sendTemplateEmail({ evento, to, variables });

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "No se pudo enviar el email. Revisa la configuración SMTP." }, { status: 500 });
    }
  } catch (error) {
    console.error("[Email Test] Error:", error);
    return NextResponse.json({ error: "Error al enviar email" }, { status: 500 });
  }
}