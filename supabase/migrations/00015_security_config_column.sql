-- Agregar security_config a app_settings para el dashboard de seguridad
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS security_config JSONB DEFAULT '{}';

-- Inicializar con defaults para la app "guau"
UPDATE app_settings
SET security_config = '{
  "geobloqueo": {
    "habilitado": false,
    "modo": "bloquear_lista",
    "paises_bloqueados": ["CN","RU","KP","IR"],
    "paises_permitidos": ["AR","BO","CL","CO","CR","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","PR","ES","UY","VE","BR","US","CA","GB","FR","DE","IT","CH","NL","BE","AT","IE","PT","SE","NO","DK","FI","IS","PL","CZ","SK","HU","RO","BG","HR","SI","EE","LV","LT","GR","CY","MT","LU","JP","KR","TW","SG","AU","NZ","PH","IL","AE","SA","QA","KW","BH","OM","JO","TR","EG","MA","TN","DZ","ZA","KE","GH","HK","MO","TH","MY","ID","IN","UA","AL","MK","ME","RS","BA","XK"],
    "mensaje_bloqueo": "Acceso denegado desde tu ubicación"
  },
  "security_headers": {
    "habilitado": false,
    "headers": {
      "content-security-policy": {"habilitado": false, "valor": "default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; font-src ''self''; connect-src ''self'' https://*.supabase.co"},
      "strict-transport-security": {"habilitado": true, "valor": "max-age=63072000; includeSubDomains; preload"},
      "x-frame-options": {"habilitado": true, "valor": "DENY"},
      "x-content-type-options": {"habilitado": true, "valor": "nosniff"},
      "referrer-policy": {"habilitado": true, "valor": "strict-origin-when-cross-origin"},
      "permissions-policy": {"habilitado": false, "valor": "camera=(), microphone=(), geolocation=()"}
    }
  },
  "rate_limiting": {
    "habilitado": false,
    "mensaje_limite": "Demasiadas peticiones. Intenta de nuevo en unos segundos.",
    "reglas": [
      {"ruta": "/api/leads", "metodo": "POST", "limite": 5, "ventana_segundos": 60, "habilitado": false, "descripcion": "Formularios de leads", "protege_contra": "Spam de formularios"},
      {"ruta": "/api/referrals", "metodo": "POST", "limite": 10, "ventana_segundos": 60, "habilitado": false, "descripcion": "Creación de referidos", "protege_contra": "Abuso del sistema de referidos"}
    ]
  },
  "alerts": {
    "habilitado": false,
    "email_destino": "",
    "webhook_url": "",
    "reglas": [
      {"id": "geo_spike", "nombre": "Pico de geobloqueo", "tipo": "geo_spike", "nivel": "critical", "umbral": 20, "ventana_minutos": 5, "habilitado": false, "notificar_email": true, "notificar_webhook": false},
      {"id": "rate_brute", "nombre": "Posible fuerza bruta", "tipo": "rate_spike", "nivel": "warning", "umbral": 10, "ventana_minutos": 5, "habilitado": false, "notificar_email": true, "notificar_webhook": false},
      {"id": "route_attack", "nombre": "Ruta bajo ataque", "tipo": "route_attack", "nivel": "warning", "umbral": 30, "ventana_minutos": 10, "habilitado": false, "notificar_email": true, "notificar_webhook": false},
      {"id": "traffic_anomaly", "nombre": "Anomalía de tráfico", "tipo": "traffic_anomaly", "nivel": "critical", "umbral": 5, "ventana_minutos": 60, "habilitado": false, "notificar_email": true, "notificar_webhook": false}
    ]
  }
}'::jsonb
WHERE application_id = (SELECT id FROM applications WHERE slug = 'guau')
  AND security_config = '{}'::jsonb;
