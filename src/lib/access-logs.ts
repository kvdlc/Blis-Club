/**
 * Logs de Acceso
 * Registra en Supabase cada request bloqueado (geobloqueo / rate limiting).
 * Fire-and-forget: no bloquea el request original.
 */

import { createClient } from "@supabase/supabase-js";

interface LogEntry {
  ip: string;
  pais: string;
  ruta: string;
  metodo: string;
  motivo: string;
  user_agent?: string;
}

export function logSecurityEvent(entry: LogEntry): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  supabase
    .from("security_logs")
    .insert({
      ip: entry.ip,
      pais: entry.pais,
      ruta: entry.ruta,
      metodo: entry.metodo,
      motivo: entry.motivo,
      user_agent: entry.user_agent || null,
    })
    .then(({ error }) => {
      if (error && process.env.NODE_ENV === "development") {
        console.error("[AccessLogs] Error registrando:", error.message);
      }
    });
}
