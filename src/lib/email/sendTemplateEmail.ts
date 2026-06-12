import { createClient } from "@supabase/supabase-js";

interface TemplateEmailParams {
  evento: string;
  to: string;
  subject?: string;
  variables: Record<string, string>;
}

const PRIMARY = "#5956e9";
const PRIMARY_DARK = "#4a47d4";
const PRIMARY_LIGHT = "#eeedff";
const TEXT_HEADING = "#1f2937";
const TEXT_BODY = "#4b5563";
const TEXT_MUTED = "#9ca3af";
const BG_OUTER = "#f4f3ff";
const BG_CARD = "#ffffff";
const BORDER_LIGHT = "#e5e7eb";

function emailShell(innerHtml: string, opts?: { accentColor?: string; footerText?: string }): string {
  const accentNeutral = !opts?.accentColor;
  const accent = accentNeutral ? PRIMARY : opts!.accentColor!;
  const footerText = opts?.footerText || "Blis Club — Ecosistema digital";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blis Club</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table{border-collapse:collapse!important}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0!important;padding:0!important;width:100%!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
    @media only screen and (max-width:620px){
      .email-container{width:100%!important;max-width:100%!important}
      .fluid{width:100%!important;max-width:100%!important;height:auto!important}
      .stack-column{display:block!important;width:100%!important;max-width:100%!important}
      .stack-column-center{text-align:center!important}
      .center-on-narrow{text-align:center!important;display:block!important;margin-left:auto!important;margin-right:auto!important;float:none!important}
      .padding-mobile{padding-left:10px!important;padding-right:10px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_OUTER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <center style="width:100%;background-color:${BG_OUTER};padding:32px 0;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" class="email-container" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BG_CARD};border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">

            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center">
                      <div style="width:52px;height:52px;background:${accent};border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                        <span style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">B</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 40px 40px 40px;" class="padding-mobile">
                ${innerHtml}
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">${footerText}</p>
          <p style="margin:4px 0 0;font-size:11px;line-height:1.4;color:${TEXT_MUTED};">Si no solicitaste este correo, puedes ignorarlo.</p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}

function heading(text: string, color?: string): string {
  return `<h1 style="margin:0;font-size:22px;font-weight:700;color:${color || TEXT_HEADING};text-align:center;line-height:1.3;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:8px 0 0;font-size:15px;color:${TEXT_BODY};text-align:center;line-height:1.5;">${text}</p>`;
}

function paragraph(text: string, align?: string): string {
  return `<p style="margin:16px 0 0;font-size:15px;color:${TEXT_BODY};text-align:${align || "center"};line-height:1.6;">${text}</p>`;
}

function paragraphMuted(text: string): string {
  return `<p style="margin:12px 0 0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">${text}</p>`;
}

function spacer(h?: number): string {
  return `<div style="height:${h || 24}px;font-size:0;line-height:0;">&nbsp;</div>`;
}

function divider(): string {
  return `<div style="border-top:1px solid ${BORDER_LIGHT};margin:24px 0;font-size:0;line-height:0;">&nbsp;</div>`;
}

function button(text: string, url: string, color?: string): string {
  const bg = color || PRIMARY;
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;mso-padding-alt:0;text-underline:none;">${text}</a>
  </div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:${TEXT_MUTED};width:100px;text-align:right;vertical-align:top;">${label}</td>
    <td style="padding:8px 0 8px 12px;font-size:14px;color:${TEXT_HEADING};vertical-align:top;font-weight:500;">${value}</td>
  </tr>`;
}

function iconCircle(emoji: string, bgColor: string): string {
  return `<div style="width:56px;height:56px;background:${bgColor};border-radius:50%;display:inline-block;text-align:center;line-height:56px;font-size:26px;margin:0 auto;">${emoji}</div>`;
}

function credentialsBlock(email: string, password: string): string {
  if (!password) return "";
  return `${spacer(8)}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${PRIMARY_LIGHT};border-radius:14px;margin:0;">
    <tr>
      <td style="padding:24px 28px;">
        <p style="margin:0 0 14px;font-size:13px;color:${TEXT_MUTED};text-align:center;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">Tus datos de acceso</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" align="center">
          ${detailRow("Correo", `<span style="font-family:ui-monospace,SFMono-Regular,'Courier New',monospace;font-size:13px;background:#fff;padding:3px 10px;border-radius:6px;">${email}</span>`)}
          ${detailRow("Contraseña", `<span style="font-family:ui-monospace,SFMono-Regular,'Courier New',monospace;font-size:13px;background:#fff;padding:3px 10px;border-radius:6px;">${password}</span>`)}
        </table>
      </td>
    </tr>
  </table>`;
}

function buildWelcomeHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const appUrl = vars.app_url || "https://blis.club";
  const appName = vars.app_name || "Blis Club";
  const email = vars.email || "";
  const password = vars.password || "";

  return emailShell(`
    ${spacer(4)}
    ${heading(`¡Bienvenido${appName !== "Blis Club" ? " a " + appName : ""}!`)}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>, tu cuenta está lista.`)}
    ${credentialsBlock(email, password)}
    ${paragraph("Puedes acceder ahora con los datos de arriba.")}
    ${button("Ingresar", appUrl)}
  `, { footerText: `${appName} — Ecosistema digital` });
}

function buildPasswordResetHTML(vars: Record<string, string>): string {
  const enlace = vars.enlace_reset || "#";
  return emailShell(`
    ${spacer(4)}
    ${heading("Restablecer contraseña")}
    ${paragraph("Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:")}
    ${button("Restablecer contraseña", enlace)}
    ${paragraphMuted("Este enlace expira en 24 horas. Si no lo solicitaste, ignora este correo.")}
  `, { footerText: "Blis Club — Ecosistema digital" });
}

function buildPaymentConfirmedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "";
  const plan = vars.plan || "";
  const appUrl = vars.app_url || "https://blis.club";
  const appName = vars.app_name || "Blis Club";
  const appNameLabel = appName !== "Blis Club" ? ` a ${appName}` : "";
  return emailShell(`
    ${spacer(4)}
    <div style="text-align:center;">${iconCircle("✓", "#d1fae5")}</div>
    ${spacer(8)}
    ${heading("¡Pago confirmado!")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>, tu suscripción${appNameLabel} está activa.`)}
    ${monto ? paragraph(`Monto: <strong>${monto}</strong>${plan ? ` · Plan: <strong>${plan}</strong>` : ""}`) : ""}
    ${button("Ir a la app", appUrl)}
  `, { footerText: `${appName} — Ecosistema digital` });
}

function buildSubscriptionExpiringHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const fecha = vars.fecha_expiracion || "";
  const appUrl = vars.app_url || "https://blis.club";
  const appName = vars.app_name || "Blis Club";
  return emailShell(`
    ${spacer(4)}
    <div style="text-align:center;">${iconCircle("⏰", "#fef3c7")}</div>
    ${spacer(8)}
    ${heading("Tu suscripción está por vencer")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(fecha ? `Tu suscripción vence el <strong>${fecha}</strong>. Renueva para seguir disfrutando de todos los beneficios.` : "Tu suscripción está por vencer. Renueva para no perder acceso.")}
    ${button("Renovar suscripción", `${appUrl}/suscripcion`)}
  `, { footerText: `${appName} — Ecosistema digital` });
}

function buildSubscriptionExpiredHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const appUrl = vars.app_url || "https://blis.club";
  const appName = vars.app_name || "Blis Club";
  return emailShell(`
    ${spacer(4)}
    ${heading("Suscripción expirada")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph("Tu período de suscripción ha finalizado. Suscríbete para continuar con acceso completo.")}
    ${button("Suscribirme", `${appUrl}/suscripcion`)}
  `, { footerText: `${appName} — Ecosistema digital` });
}

function buildCommissionAvailableHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const referido = vars.referido || "un referido";
  const appUrl = vars.app_url || "https://blis.club";
  return emailShell(`
    ${spacer(4)}
    ${heading("¡Comisión disponible!")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Tu comisión de <strong>${monto}</strong> por <strong>${referido}</strong> ya está disponible para retirar.`)}
    ${button("Ir a mi Billetera", `${appUrl}/perfil/billetera`)}
  `, { footerText: "Blis Club — Ecosistema digital" });
}

function buildWithdrawalRequestedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const metodo = vars.metodo || "Binance Pay";
  return emailShell(`
    ${spacer(4)}
    ${heading("Solicitud de retiro recibida")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Hemos recibido tu solicitud de retiro por <strong>${monto}</strong> vía <strong>${metodo}</strong>.`)}
    ${paragraphMuted("Los retiros se procesan del 1 al 5 de cada mes. Tu solicitud quedará en cola y será ejecutada en la siguiente ventana de pago.")}
  `, { footerText: "Blis Club — Ecosistema digital" });
}

function buildWithdrawalProcessingHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  return emailShell(`
    ${spacer(4)}
    ${heading("Retiro en procesamiento")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Tu retiro de <strong>${monto}</strong> está siendo procesado. Te notificaremos cuando se complete.`)}
  `, { footerText: "Blis Club — Ecosistema digital" });
}

function buildWithdrawalCompletedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const referencia = vars.referencia || "—";
  return emailShell(`
    ${spacer(4)}
    <div style="text-align:center;">${iconCircle("✓", "#d1fae5")}</div>
    ${spacer(8)}
    ${heading("¡Retiro completado!")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Tu retiro de <strong>${monto}</strong> se completó exitosamente.`)}
    ${divider()}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${detailRow("Monto", `<strong>${monto}</strong>`)}
      ${detailRow("Referencia", `<span style="font-family:ui-monospace,SFMono-Regular,'Courier New',monospace;font-size:12px;">${referencia}</span>`)}
    </table>
  `, { footerText: "Blis Club — Ecosistema digital" });
}

function buildWithdrawalFailedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const razon = vars.razon || "Error técnico";
  const appUrl = vars.app_url || "https://blis.club";
  return emailShell(`
    ${spacer(4)}
    ${heading("Retiro fallido", "#b91c1c")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Tu retiro de <strong>${monto}</strong> no pudo completarse.`)}
    ${divider()}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${detailRow("Motivo", razon)}
    </table>
    ${paragraph("El saldo ha sido devuelto a tu billetera. Puedes intentar nuevamente.")}
    ${button("Reintentar retiro", `${appUrl}/perfil/billetera`)}
  `, { accentColor: "#b91c1c", footerText: "Blis Club — Ecosistema digital" });
}

function buildWithdrawalRejectedHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  const monto = vars.monto || "$0.00";
  const razon = vars.razon || "Verificación de seguridad";
  return emailShell(`
    ${spacer(4)}
    ${heading("Retiro rechazado", "#b91c1c")}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(`Tu solicitud de retiro de <strong>${monto}</strong> fue rechazada por nuestro equipo de seguridad.`)}
    ${divider()}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${detailRow("Motivo", razon)}
    </table>
    ${paragraph("El saldo ha sido devuelto a tu billetera. Si crees que es un error, contacta a soporte.")}
  `, { accentColor: "#b91c1c", footerText: "Blis Club — Ecosistema digital" });
}

function buildGenericHTML(vars: Record<string, string>, title: string, body: string): string {
  const nombre = vars.nombre || vars.display_name || "Usuario";
  return emailShell(`
    ${spacer(4)}
    ${heading(title)}
    ${subheading(`Hola <strong style="color:${TEXT_HEADING}">${nombre}</strong>`)}
    ${paragraph(body)}
  `, { footerText: "Blis Club — Ecosistema digital" });
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
    commission_available: "¡Tu comisión está disponible! — Blis Club",
    withdrawal_requested: "Solicitud de retiro recibida — Blis Club",
    withdrawal_processing: "Tu retiro está siendo procesado — Blis Club",
    withdrawal_completed: "¡Retiro completado! — Blis Club",
    withdrawal_failed: "Tu retiro no pudo completarse — Blis Club",
    withdrawal_rejected: "Tu retiro fue rechazado — Blis Club",
  };
  return subjects[evento] || "Notificación — Blis Club";
}

function buildFallbackForEvent(evento: string, vars: Record<string, string>): string {
  switch (evento) {
    case "bienvenida":
      return buildWelcomeHTML(vars);
    case "restablecer_password":
      return buildPasswordResetHTML(vars);
    case "pago_confirmado":
      return buildPaymentConfirmedHTML(vars);
    case "pago_vencido":
      return buildSubscriptionExpiringHTML(vars);
    case "suscripcion_expirada":
      return buildSubscriptionExpiredHTML(vars);
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
      return buildGenericHTML(vars, "Notificación", "Tienes una notificación de Blis Club.");
  }
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

    const { data: template } = await supabase
      .from("email_templates")
      .select("settings, blocks, nombre, html_body, subject")
      .eq("evento", evento)
      .maybeSingle();

    const variablesWithBlock = { ...variables };
    if (evento === "bienvenida" && variables.password) {
      variablesWithBlock.credentials_block = credentialsBlock(variablesWithBlock.email || "", variablesWithBlock.password || "");
    } else {
      variablesWithBlock.credentials_block = "";
    }

    let html = "";

    if (template?.html_body) {
      html = template.html_body;
      for (const [key, value] of Object.entries(variablesWithBlock)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
        html = html.replace(new RegExp(`\\[${key}\\]`, "g"), value);
      }
      html = html.replace(/\{\{(\w+)\}\}/g, "");
    } else {
      html = buildFallbackForEvent(evento, variables);
    }

    const { data: senderData } = await supabase
      .from("email_senders")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();

    const senderRow = senderData as Record<string, unknown> | null;
    const senderConfig = (senderRow?.config as Record<string, string>) || {};

    const fromName = senderConfig.from_name || String(senderRow?.nombre || "") || "Blis Club";
    const fromEmail = senderConfig.from_email || process.env.SMTP_USER || "hola@blis.club";

    const finalSubject = subject || (template as Record<string, unknown>)?.subject as string || getSubjectForEvent(evento);

    const provider = String(senderRow?.provider || "smtp");

    if (provider === "resend" && senderConfig.api_key) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${senderConfig.api_key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to, subject: finalSubject, html }),
      });
      console.log(`[sendTemplateEmail] Resend a ${to} (evento: ${evento}) → ${res.status}`);
      return res.ok;
    }

    if (provider === "sendgrid" && senderConfig.api_key) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${senderConfig.api_key}`, "Content-Type": "application/json" },
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

    const smtpHost = senderConfig.smtp_host || process.env.SMTP_HOST || "";
    const smtpPort = parseInt(senderConfig.smtp_port || process.env.SMTP_PORT || "465");
    const smtpUser = senderConfig.smtp_user || process.env.SMTP_USER || "";
    const smtpPass = senderConfig.smtp_pass || process.env.SMTP_PASS || "";

    if (!smtpHost || !smtpUser) {
      console.log("[sendTemplateEmail] SMTP no configurado — no se pudo enviar");
      return false;
    }

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