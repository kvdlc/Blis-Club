import { NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email/sendTemplateEmail";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const { to, evento } = await request.json();

    if (!to || !evento) {
      return NextResponse.json({ error: "to y evento son requeridos" }, { status: 400 });
    }

    // First check if sender is configured
    const supabase = createServiceClient();
    const { data: senderData } = await supabase
      .from("email_senders")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();

    if (!senderData) {
      return NextResponse.json({ error: "No hay remitente configurado. Agrega un remitente principal en la pestaña Remitentes." }, { status: 500 });
    }

    const sender = senderData as Record<string, unknown>;
    const config = (sender.config as Record<string, string>) || {};
    const provider = String(sender.provider || "smtp");

    if (provider === "smtp") {
      const host = config.smtp_host || process.env.SMTP_HOST || "";
      const user = config.smtp_user || process.env.SMTP_USER || "";
      if (!host || !user) {
        return NextResponse.json({
          error: `SMTP incompleto. Host: "${host}" (vacío = no configurado), User: "${user}" (vacío = no configurado). Configura host, puerto, usuario y contraseña en el remitente.`,
          debug: { host, port: config.smtp_port || "465", user, pass_set: !!config.smtp_pass, from_name: config.from_name, from_email: config.from_email }
        }, { status: 500 });
      }
    } else if (provider === "resend" || provider === "sendgrid") {
      if (!config.api_key) {
        return NextResponse.json({ error: `Proveedor ${provider} sin API key configurada.` }, { status: 500 });
      }
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
      return NextResponse.json({ error: "sendTemplateEmail retornó false. Revisa los logs del servidor para más detalles." }, { status: 500 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Email Test] Error:", msg);
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}