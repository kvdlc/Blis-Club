/**
 * Envío de emails transaccionales con templates
 * Soporta SMTP (nodemailer), Resend y SendGrid.
 *
 * Eventos soportados:
 * - bienvenida: email de bienvenida
 * - restablecer_password: reset de contraseña
 * - verificacion: verificación de email
 * - factura_emitida: confirmación de pago
 * - pago_vencido: aviso de suscripción por vencer
 * - invitacion: invitación a la plataforma
 * - commission_available: comisión lista para retirar
 * - withdrawal_requested: solicitud de retiro recibida
 * - withdrawal_processing: retiro en procesamiento
 * - withdrawal_completed: retiro completado
 * - withdrawal_failed: retiro fallido (saldo devuelto)
 * - withdrawal_rejected: retiro rechazado por admin
 */

import { createClient } from "@supabase/supabase-js";

interface TemplateEmailParams {
  evento: string;
  to: string;
  subject?: string;
  variables: Record<string, string>;
}

interface SenderConfig {
  provider: string;
  config: Record<string, string>;
  from_name?: string;
  from_email?: string;
}

function buildWelcomeHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blis.club') || "https://blis.club";
  const enlace = vars.enlace_acceso || `${siteUrl}/guau/app`;
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:24px;font-weight:800;color:#4a47d4;text-align:center;margin:0 0 8px;">¡Bienvenido a Blis Club!</h1>
      <p style="text-align:center;color:#6b7280;margin:0 0 24px;">Hola <strong style="color:#1f2937">${nombre}</strong>, tu cuenta ha sido creada exitosamente.</p>
      <p style="text-align:center;color:#6b7280;font-size:14px;">Comienza a explorar nutrición, entrenamiento y seguimiento para tu perro.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${enlace}" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ingresar a Blis Club →</a>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildPasswordResetHTML(vars: Record<string, string>): string {
  const enlace = vars.enlace_reset || "#";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:24px;font-weight:800;color:#4a47d4;text-align:center;">Restablecer contraseña</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${enlace}" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Restablecer contraseña</a>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
    </div>
  </div>`;
}

function buildGenericHTML(vars: Record<string, string>, title: string, body: string): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">${title}</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">${body}</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildCommissionAvailableHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const referido = vars.referido || "un referido";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">¡Comisión Disponible!</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Tu comisión de <strong>${monto}</strong> por ${referido} ya está disponible para retirar.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${(process.env.NEXT_PUBLIC_SITE_URL || 'https://blis.club')}/guau/app/perfil/billetera" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ir a mi Billetera →</a>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildWithdrawalRequestedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const metodo = vars.metodo || "Binance Pay";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">Solicitud de Retiro Recibida</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Hemos recibido tu solicitud de retiro por <strong>${monto}</strong> vía <strong>${metodo}</strong>.</p>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;">Los retiros se procesan del <strong>1 al 5 de cada mes</strong>. Tu solicitud quedará en cola y será ejecutada en la siguiente ventana de pago.</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildWithdrawalProcessingHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">Retiro en Procesamiento</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Tu retiro de <strong>${monto}</strong> está siendo procesado. Te enviaremos otro email cuando se complete.</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildWithdrawalCompletedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const referencia = vars.referencia || "—";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">¡Retiro Completado!</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Tu retiro de <strong>${monto}</strong> ha sido completado exitosamente.</p>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Referencia / TX ID:</strong> <span style="font-family:monospace;">${referencia}</span></p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildWithdrawalFailedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const razon = vars.razon || "Error técnico";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#dc2626;text-align:center;">Retiro Fallido</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Lamentamos informarte que tu retiro de <strong>${monto}</strong> no pudo completarse.</p>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Motivo:</strong> ${razon}</p>
      <p style="text-align:center;color:#374151;margin-top:16px;">El saldo ha sido devuelto a tu billetera. Puedes intentar nuevamente.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${(process.env.NEXT_PUBLIC_SITE_URL || 'https://blis.club')}/guau/app/perfil/billetera" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ir a mi Billetera →</a>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

function buildWithdrawalRejectedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const razon = vars.razon || "Verificación de seguridad";
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
    <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px;font-weight:800;color:#dc2626;text-align:center;">Retiro Rechazado</h1>
      <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola ${nombre},</p>
      <p style="text-align:center;color:#374151;">Tu solicitud de retiro de <strong>${monto}</strong> ha sido rechazada por nuestro equipo de seguridad.</p>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Motivo:</strong> ${razon}</p>
      <p style="text-align:center;color:#374151;margin-top:16px;">El saldo ha sido devuelto a tu billetera. Si crees que esto es un error, contacta a soporte.</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
  </div>`;
}

export async function sendTemplateEmail(params: TemplateEmailParams): Promise<boolean> {
  const { evento, to, subject, variables } = params;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("[sendTemplateEmail] Sin credenciales Supabase");
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar template por evento (si existe en DB)
    const { data: template } = await supabase
      .from("email_templates")
      .select("settings, blocks, nombre")
      .eq("evento", evento)
      .maybeSingle();

    let html = "";

    if (template?.settings && template?.blocks) {
      // TODO: integrar con el HTML generator del builder visual cuando esté disponible
      // Por ahora, usar fallback por tipo de evento
      html = buildFallbackForEvent(evento, variables);
    } else {
      html = buildFallbackForEvent(evento, variables);
    }

    // 2. Buscar sender configurado
    const { data: senderData } = await supabase
      .from("email_senders")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();

    const sender = senderData as unknown as SenderConfig | null;

    let fromName = "Blis Club";
    let fromEmail = process.env.SMTP_USER || "hola@blis.club";

    if (sender?.from_name) fromName = sender.from_name;
    if (sender?.from_email) fromEmail = sender.from_email;

    const finalSubject = subject || getSubjectForEvent(evento);

    // 3. Enviar según provider
    if (sender?.provider === "resend" && sender.config?.api_key) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sender.config.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to, subject: finalSubject, html }),
      });
      console.log(`[sendTemplateEmail] Resend a ${to} (evento: ${evento}) → ${res.status}`);
      return res.ok;
    }

    if (sender?.provider === "sendgrid" && sender.config?.api_key) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sender.config.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: fromName },
          subject: finalSubject,
          content: [{ type: "text/html", value: html }],
        }),
      });
      console.log(`[sendTemplateEmail] SendGrid a ${to} (evento: ${evento}) → ${res.status}`);
      return res.ok;
    }

    // SMTP por defecto
    const smtpHost = sender?.config?.smtp_host || process.env.SMTP_HOST || "";
    const smtpPort = parseInt(sender?.config?.smtp_port || process.env.SMTP_PORT || "465");
    const smtpUser = sender?.config?.smtp_user || process.env.SMTP_USER || "";
    const smtpPass = sender?.config?.smtp_pass || process.env.SMTP_PASS || "";

    if (!smtpHost || !smtpUser) {
      console.log("[sendTemplateEmail] SMTP no configurado — no se pudo enviar");
      return false;
    }

    // Dynamic import para evitar error en Edge Runtime
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: finalSubject,
      html,
    });

    console.log(`[sendTemplateEmail] SMTP enviado a ${to} (evento: ${evento})`);
    return true;
  } catch (e) {
    console.error("[sendTemplateEmail] Error:", e);
    return false;
  }
}

function getSubjectForEvent(evento: string): string {
  const subjects: Record<string, string> = {
    bienvenida: "¡Bienvenido a Blis Club!",
    restablecer_password: "Restablece tu contraseña — Blis Club",
    verificacion: "Verifica tu correo — Blis Club",
    pago_confirmado: "Pago confirmado — Blis Club",
    pago_vencido: "Tu suscripción está por vencer — Blis Club",
    suscripcion_expirada: "Tu suscripción ha expirado — Blis Club",
    invitacion: "Te han invitado a Blis Club",
    receta_semanal: "Receta semanal — Blis Club",
    recordatorio_entrenamiento: "Recordatorio de entrenamiento — Blis Club",
    commission_available: "¡Tu comisión está disponible! — Blis Club",
    withdrawal_requested: "Solicitud de retiro recibida — Blis Club",
    withdrawal_processing: "Tu retiro está siendo procesado — Blis Club",
    withdrawal_completed: "¡Retiro completado! — Blis Club",
    withdrawal_failed: "Tu retiro no pudo completarse — Blis Club",
    withdrawal_rejected: "Tu retiro fue rechazado — Blis Club",
  };
  return subjects[evento] || "Blis Club";
}

function buildFallbackForEvent(evento: string, vars: Record<string, string>): string {
  switch (evento) {
    case "bienvenida":
      return buildWelcomeHTML(vars);
    case "restablecer_password":
      return buildPasswordResetHTML(vars);
    case "pago_confirmado":
      return buildGenericHTML(vars, "¡Pago Confirmado!", "Hemos recibido tu pago correctamente. Tu suscripción está activa.");
    case "pago_vencido":
      return buildGenericHTML(vars, "Suscripción por vencer", "Tu suscripción está por vencer. Renueva para seguir disfrutando de Blis Club.");
    case "suscripcion_expirada":
      return buildGenericHTML(vars, "Suscripción Expirada", "Tu período de prueba ha finalizado. Suscríbete para continuar.");
    case "commission_available":
      return buildCommissionAvailableHTML(vars);
    case "withdrawal_requested":
      return buildWithdrawalRequestedHTML(vars);
    case "withdrawal_processing":
      return buildWithdrawalProcessingHTML(vars);
    case "withdrawal_completed":
      return buildWithdrawalCompletedHTML(vars);
    case "withdrawal_failed":
      return buildWithdrawalFailedHTML(vars);
    case "withdrawal_rejected":
      return buildWithdrawalRejectedHTML(vars);
    default:
      return buildGenericHTML(vars, "Blis Club", "Tienes una notificación de Blis Club.");
  }
}
