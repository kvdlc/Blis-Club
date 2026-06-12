-- Seed email templates for Blis Club
-- Uses {{variable}} syntax for dynamic content replacement

INSERT INTO email_templates (nombre, evento, subject, html_body, application_id)
VALUES
('Bienvenida', 'bienvenida', '¡Bienvenido a Blis Club!', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:24px;font-weight:800;color:#4a47d4;text-align:center;margin:0 0 8px;">¡Bienvenido a Blis Club!</h1>
    <p style="text-align:center;color:#6b7280;margin:0 0 24px;">Hola <strong style="color:#1f2937">{{nombre}}</strong>, tu cuenta ha sido creada exitosamente.</p>
    {{credentials_block}}
    <p style="text-align:center;color:#6b7280;font-size:14px;">Comienza a explorar nutrición, entrenamiento y seguimiento para tu perro.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://www.blis.club/guau/app" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ingresar a Blis Club →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Pago Confirmado', 'pago_confirmado', '¡Pago Confirmado! — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
    </div>
    <h1 style="font-size:24px;font-weight:800;color:#4a47d4;text-align:center;margin:0 0 8px;">¡Pago Confirmado!</h1>
    <p style="text-align:center;color:#6b7280;margin:0 0 8px;">Hola <strong style="color:#1f2937">{{nombre}}</strong>,</p>
    <p style="text-align:center;color:#374151;">Tu suscripción ha sido activada exitosamente.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.blis.club/guau/app" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ir a la App →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Suscripción por Vencer', 'pago_vencido', 'Tu suscripción está por vencer — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:56px;height:56px;background:#fef3c7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">⏰</span>
      </div>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">Tu suscripción está por vencer</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu suscripción a Blis Club está por expirar. ¡Renueva para seguir disfrutando de todos los beneficios!</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.blis.club/guau/app/perfil/pago" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Renovar Suscripción →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Suscripción Expirada', 'suscripcion_expirada', 'Tu suscripción ha expirado — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">Suscripción Expirada</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu período de suscripción ha finalizado. ¡Suscríbete para continuar disfrutando de Blis Club!</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.blis.club/guau/app/suscripcion" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Suscribirme →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Restablecer Contraseña', 'restablecer_password', 'Restablece tu contraseña — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:24px;font-weight:800;color:#4a47d4;text-align:center;">Restablecer contraseña</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{enlace_reset}}" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Restablecer contraseña</a>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Comisión Disponible', 'commission_available', '¡Tu comisión está disponible! — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">¡Comisión Disponible!</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu comisión de <strong>{{monto}}</strong> por {{referido}} ya está disponible para retirar.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.blis.club/guau/app/perfil/billetera" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ir a mi Billetera →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Solicitado', 'withdrawal_requested', 'Solicitud de retiro recibida — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">Solicitud de Retiro Recibida</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Hemos recibido tu solicitud de retiro por <strong>{{monto}}</strong> vía <strong>{{metodo}}</strong>.</p>
    <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;">Los retiros se procesan del <strong>1 al 5 de cada mes</strong>. Tu solicitud quedará en cola.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Completado', 'withdrawal_completed', '¡Retiro completado! — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:#4a47d4;text-align:center;">¡Retiro Completado!</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu retiro de <strong>{{monto}}</strong> ha sido completado exitosamente.</p>
    <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Referencia:</strong> <span style="font-family:monospace;">{{referencia}}</span></p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Fallido', 'withdrawal_failed', 'Tu retiro no pudo completarse — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:22px;font-weight:800;color:#dc2626;text-align:center;">Retiro Fallido</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu retiro de <strong>{{monto}}</strong> no pudo completarse.</p>
    <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Motivo:</strong> {{razon}}</p>
    <p style="text-align:center;color:#374151;margin-top:16px;">El saldo ha sido devuelto a tu billetera. Puedes intentar nuevamente.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.blis.club/guau/app/perfil/billetera" style="display:inline-block;background:#5956e9;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:16px 40px;border-radius:16px;">Ir a mi Billetera →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau')),

('Retiro Rechazado', 'withdrawal_rejected', 'Tu retiro fue rechazado — Blis Club', '
<div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#eeedff;font-family:Arial,sans-serif;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="background:#5956e9;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:28px;font-weight:900;">B</span>
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.9);border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <h1 style="font-size:22px;font-weight:800;color:#dc2626;text-align:center;">Retiro Rechazado</h1>
    <p style="text-align:center;color:#6b7280;margin:16px 0;">Hola {{nombre}},</p>
    <p style="text-align:center;color:#374151;">Tu solicitud de retiro de <strong>{{monto}}</strong> ha sido rechazada por nuestro equipo de seguridad.</p>
    <p style="text-align:center;color:#6b7280;font-size:14px;margin-top:16px;"><strong>Motivo:</strong> {{razon}}</p>
    <p style="text-align:center;color:#374151;margin-top:16px;">El saldo ha sido devuelto a tu billetera. Si crees que esto es un error, contacta a soporte.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">Blis Club · Tu ecosistema de apps para mascotas</p>
</div>',
(SELECT id FROM applications WHERE slug = 'guau'))
ON CONFLICT (evento) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  subject = EXCLUDED.subject,
  html_body = EXCLUDED.html_body;