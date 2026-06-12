-- Seed email templates for Blis Club (corporate/brand-agnostic)
-- Uses {{variable}} syntax for dynamic content replacement

INSERT INTO email_templates (nombre, evento, subject, html_body, application_id)
VALUES
('Bienvenida', 'bienvenida', '¡Bienvenido{{app_name_suffix}}!', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">¡Bienvenido{{app_name_suffix}}!</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong>, tu cuenta está lista.</p>
                {{credentials_block}}
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Puedes acceder ahora con los datos de arriba.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Ingresar</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{{app_name}} — Ecosistema digital</p>
          <p style="margin:4px 0 0;font-size:11px;line-height:1.4;color:#9ca3af;">Si no solicitaste este correo, puedes ignorarlo.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Pago Confirmado', 'pago_confirmado', '¡Pago confirmado! — {{app_name}}', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:16px;font-size:0;">&nbsp;</div>
                <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-block;text-align:center;line-height:56px;font-size:26px;margin:0 auto;">✓</div>
                <div style="height:8px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">¡Pago confirmado!</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong>, tu suscripción está activa.</p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Monto: <strong>{{monto}}</strong>{{plan_separator}}Plan: <strong>{{plan}}</strong></p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Ir a la app</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{{app_name}} — Ecosistema digital</p>
          <p style="margin:4px 0 0;font-size:11px;line-height:1.4;color:#9ca3af;">Si no solicitaste este correo, puedes ignorarlo.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Suscripción por Vencer', 'pago_vencido', 'Tu suscripción está por vencer — {{app_name}}', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:16px;font-size:0;">&nbsp;</div>
                <div style="width:56px;height:56px;background:#fef3c7;border-radius:50%;display:inline-block;text-align:center;line-height:56px;font-size:26px;margin:0 auto;">⏰</div>
                <div style="height:8px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">Tu suscripción está por vencer</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu suscripción vence el <strong>{{fecha_expiracion}}</strong>. Renueva para no perder acceso.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}/suscripcion" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Renovar suscripción</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{{app_name}} — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Suscripción Expirada', 'suscripcion_expirada', 'Tu suscripción ha expirado — {{app_name}}', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">Suscripción expirada</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu período de suscripción ha finalizado. Suscríbete para continuar con acceso completo.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}/suscripcion" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Suscribirme</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{{app_name}} — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Restablecer Contraseña', 'restablecer_password', 'Restablece tu contraseña — {{app_name}}', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">Restablecer contraseña</h1>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{enlace_reset}}" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Restablecer contraseña</a>
                </div>
                <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">Este enlace expira en 24 horas. Si no lo solicitaste, ignora este correo.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{{app_name}} — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Comisión Disponible', 'commission_available', '¡Tu comisión está disponible! — {{app_name}}', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">¡Comisión disponible!</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu comisión de <strong>{{monto}}</strong> por <strong>{{referido}}</strong> ya está disponible para retirar.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}/perfil/billetera" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Ir a mi Billetera</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">Blis Club — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Solicitado', 'withdrawal_requested', 'Solicitud de retiro recibida — Blis Club', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">Solicitud de retiro recibida</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Hemos recibido tu solicitud de retiro por <strong>{{monto}}</strong> vía <strong>{{metodo}}</strong>.</p>
                <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">Los retiros se procesan del <strong>1 al 5 de cada mes</strong>. Tu solicitud quedará en cola.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">Blis Club — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Completado', 'withdrawal_completed', '¡Retiro completado! — Blis Club', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#5956e9;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">B</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:16px;font-size:0;">&nbsp;</div>
                <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-block;text-align:center;line-height:56px;font-size:26px;margin:0 auto;">✓</div>
                <div style="height:8px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#1f2937;text-align:center;line-height:1.3;">¡Retiro completado!</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu retiro de <strong>{{monto}}</strong> se completó exitosamente.</p>
                <div style="border-top:1px solid #e5e7eb;margin:24px 0;font-size:0;line-height:0;">&nbsp;</div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#9ca3af;width:100px;text-align:right;vertical-align:top;">Monto</td>
                    <td style="padding:8px 0 8px 12px;font-size:14px;color:#1f2937;vertical-align:top;font-weight:500;"><strong>{{monto}}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#9ca3af;width:100px;text-align:right;vertical-align:top;">Referencia</td>
                    <td style="padding:8px 0 8px 12px;font-size:14px;color:#1f2937;vertical-align:top;font-weight:500;"><span style="font-family:ui-monospace,SFMono-Regular,''Courier New'',monospace;font-size:12px;">{{referencia}}</span></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">Blis Club — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Fallido', 'withdrawal_failed', 'Tu retiro no pudo completarse — Blis Club', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#b91c1c;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">!</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#b91c1c;text-align:center;line-height:1.3;">Retiro fallido</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu retiro de <strong>{{monto}}</strong> no pudo completarse.</p>
                <div style="border-top:1px solid #e5e7eb;margin:24px 0;font-size:0;line-height:0;">&nbsp;</div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#9ca3af;width:100px;text-align:right;vertical-align:top;">Motivo</td>
                    <td style="padding:8px 0 8px 12px;font-size:14px;color:#1f2937;vertical-align:top;font-weight:500;">{{razon}}</td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">El saldo ha sido devuelto a tu billetera. Puedes intentar nuevamente.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="{{app_url}}/perfil/billetera" style="display:inline-block;background:#5956e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 36px;border-radius:12px;">Reintentar retiro</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">Blis Club — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Rechazado', 'withdrawal_rejected', 'Tu retiro fue rechazado — Blis Club', '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%}
    body{margin:0!important;padding:0!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ff;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;">
  <center style="width:100%;background-color:#f4f3ff;padding:32px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto;max-width:600px;">
      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(89,86,233,0.08);">
            <tr>
              <td align="center" style="padding:36px 40px 0 40px;">
                <div style="width:52px;height:52px;background:#b91c1c;border-radius:14px;display:inline-block;text-align:center;line-height:52px;">
                  <span style="color:#fff;font-size:24px;font-weight:800;">!</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;">
                <div style="height:20px;font-size:0;">&nbsp;</div>
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#b91c1c;text-align:center;line-height:1.3;">Retiro rechazado</h1>
                <p style="margin:8px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.5;">Hola <strong style="color:#1f2937">{{nombre}}</strong></p>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">Tu solicitud de retiro de <strong>{{monto}}</strong> fue rechazada por nuestro equipo de seguridad.</p>
                <div style="border-top:1px solid #e5e7eb;margin:24px 0;font-size:0;line-height:0;">&nbsp;</div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#9ca3af;width:100px;text-align:right;vertical-align:top;">Motivo</td>
                    <td style="padding:8px 0 8px 12px;font-size:14px;color:#1f2937;vertical-align:top;font-weight:500;">{{razon}}</td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:15px;color:#4b5563;text-align:center;line-height:1.6;">El saldo ha sido devuelto a tu billetera. Si crees que es un error, contacta a soporte.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 20px 0 20px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">Blis Club — Ecosistema digital</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>',
(SELECT id FROM applications WHERE slug = 'guau'))
ON CONFLICT (evento) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  subject = EXCLUDED.subject,
  html_body = EXCLUDED.html_body;