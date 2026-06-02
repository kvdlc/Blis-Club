"use client";
import AdminGuard from "@/components/admin/AdminGuard";
import { Shield } from "lucide-react";

export default function SeguridadPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Seguridad</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Geobloqueo, rate limiting, headers y alertas</p>
        </div>

        <div className="card-soft rounded-[1.25rem] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Centro de Seguridad</p>
              <p className="text-sm text-zinc-500">La seguridad está activa en el middleware. Configúrala desde la base de datos o la API.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Geobloqueo", desc: "Bloquea accesos desde países maliciosos. 30 países bloqueados por defecto.", status: "Hardcoded + DB" },
              { title: "Rate Limiting", desc: "Protege endpoints contra abusos. Token bucket en memoria.", status: "Configurable" },
              { title: "Security Headers", desc: "CSP, HSTS, X-Frame-Options, Referrer-Policy.", status: "Configurable" },
              { title: "Alertas", desc: "Detección de patrones de ataque con notificaciones.", status: "Configurable" },
              { title: "Logs de Acceso", desc: "Registro de cada request bloqueado en security_logs.", status: "Activo" },
              { title: "Login History", desc: "Historial de inicios de sesión con IP y país.", status: "Activo" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">{item.title}</p>
                <p className="text-xs text-zinc-500 mb-2">{item.desc}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
