"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Shield, Plus, Edit, Trash2, Save, X } from "lucide-react";

const HEADERS_DEFAULTS: Record<string, { habilitado: boolean; valor: string }> = {
  "content-security-policy": { habilitado: true, valor: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
  "strict-transport-security": { habilitado: true, valor: "max-age=31536000; includeSubDomains; preload" },
  "x-frame-options": { habilitado: true, valor: "DENY" },
  "x-content-type-options": { habilitado: true, valor: "nosniff" },
  "referrer-policy": { habilitado: true, valor: "strict-origin-when-cross-origin" },
  "permissions-policy": { habilitado: true, valor: "camera=(), microphone=(), geolocation=()" },
};

const DEFAULT_SECURITY_CONFIG = {
  geobloqueo: {
    habilitado: false,
    modo: "bloquear_lista" as const,
    paises_bloqueados: [] as string[],
    paises_permitidos: [] as string[],
    mensaje_bloqueo: "Acceso restringido desde tu ubicación.",
  },
  rate_limiting: {
    habilitado: false,
    reglas: [] as { ruta: string; metodo: string; limite: number; ventana_segundos: number; habilitado: boolean }[],
    mensaje_limite: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
  },
  security_headers: {
    habilitado: true,
    headers: HEADERS_DEFAULTS,
  },
  alertas: {
    habilitado: false,
    email_destino: "",
    webhook_url: "",
    reglas: [] as { nombre: string; tipo: string; nivel: string; umbral: number; ventana_minutos: number; habilitado: boolean }[],
  },
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default function SeguridadPage() {
  const [settings, setSettings] = useState<any>(null);
  const [securityConfig, setSecurityConfig] = useState(deepClone(DEFAULT_SECURITY_CONFIG));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = useState("");

  // Rate limiting rule modal
  const [rlModal, setRlModal] = useState(false);
  const [rlEditingIndex, setRlEditingIndex] = useState<number | null>(null);
  const [rlForm, setRlForm] = useState({ ruta: "/api/", metodo: "POST", limite: 100, ventana_segundos: 60, habilitado: true });

  // Alertas rule modal
  const [alertaModal, setAlertaModal] = useState(false);
  const [alertaEditingIndex, setAlertaEditingIndex] = useState<number | null>(null);
  const [alertaForm, setAlertaForm] = useState({ nombre: "", tipo: "intentos_fallidos", nivel: "warning", umbral: 10, ventana_minutos: 5, habilitado: true });

  useEffect(() => {
    fetch("/api/admin/app-settings?app=guau")
      .then((r) => r.json())
      .then((j) => {
        const data = j.data || {};
        setSettings(data);
        if (data.security_config) {
          setSecurityConfig(deepClone(data.security_config));
        }
        setLoading(false);
      });
  }, []);

  const updateConfig = (path: string, value: any) => {
    setSecurityConfig((prev: any) => {
      const clone = deepClone(prev);
      const keys = path.split(".");
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
    setSavedMsg("");
  };

  const saveAll = async () => {
    if (!settings?.id) return;
    setSaving({ all: true });
    await fetch("/api/admin/app-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: settings.id, security_config: securityConfig }),
    });
    setSaving({});
    setSavedMsg("Guardado correctamente");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  // ---- Rate Limiting Rules helpers ----
  const openRlModal = (index: number | null) => {
    if (index !== null) {
      const rule = securityConfig.rate_limiting.reglas[index];
      setRlForm({ ruta: rule.ruta, metodo: rule.metodo, limite: rule.limite, ventana_segundos: rule.ventana_segundos, habilitado: rule.habilitado });
      setRlEditingIndex(index);
    } else {
      setRlForm({ ruta: "/api/", metodo: "POST", limite: 100, ventana_segundos: 60, habilitado: true });
      setRlEditingIndex(null);
    }
    setRlModal(true);
  };

  const saveRlRule = () => {
    const rules = deepClone(securityConfig.rate_limiting.reglas);
    if (rlEditingIndex !== null) {
      rules[rlEditingIndex] = { ...rlForm };
    } else {
      rules.push({ ...rlForm });
    }
    updateConfig("rate_limiting.reglas", rules);
    setRlModal(false);
  };

  const deleteRlRule = (index: number) => {
    const rules = deepClone(securityConfig.rate_limiting.reglas);
    rules.splice(index, 1);
    updateConfig("rate_limiting.reglas", rules);
  };

  // ---- Alertas Rules helpers ----
  const openAlertaModal = (index: number | null) => {
    if (index !== null) {
      const rule = securityConfig.alertas.reglas[index];
      setAlertaForm({ nombre: rule.nombre, tipo: rule.tipo, nivel: rule.nivel, umbral: rule.umbral, ventana_minutos: rule.ventana_minutos, habilitado: rule.habilitado });
      setAlertaEditingIndex(index);
    } else {
      setAlertaForm({ nombre: "", tipo: "intentos_fallidos", nivel: "warning", umbral: 10, ventana_minutos: 5, habilitado: true });
      setAlertaEditingIndex(null);
    }
    setAlertaModal(true);
  };

  const saveAlertaRule = () => {
    const rules = deepClone(securityConfig.alertas.reglas);
    if (alertaEditingIndex !== null) {
      rules[alertaEditingIndex] = { ...alertaForm };
    } else {
      rules.push({ ...alertaForm });
    }
    updateConfig("alertas.reglas", rules);
    setAlertaModal(false);
  };

  const deleteAlertaRule = (index: number) => {
    const rules = deepClone(securityConfig.alertas.reglas);
    rules.splice(index, 1);
    updateConfig("alertas.reglas", rules);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary-500" : "bg-zinc-300"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-center py-12 text-zinc-500">Cargando...</div>
      </AdminGuard>
    );
  }

  const sc = securityConfig;

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Centro de Seguridad</h1>
            <p className="text-sm text-zinc-500 mt-1">Geobloqueo, rate limiting, headers y alertas</p>
          </div>
          <button
            onClick={saveAll}
            disabled={!!saving.all}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving.all ? "Guardando..." : "Guardar todo"}
          </button>
        </div>

        {savedMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-2xl">
            {savedMsg}
          </div>
        )}

        {/* ---- Section 1: Geobloqueo ---- */}
        <div className="card-soft rounded-[1.25rem] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-800">Geobloqueo</p>
              <p className="text-sm text-zinc-500">Controla el acceso por país de origen</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700">Habilitado</span>
              <Toggle value={sc.geobloqueo.habilitado} onChange={(v) => updateConfig("geobloqueo.habilitado", v)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Modo</label>
              <select
                value={sc.geobloqueo.modo}
                onChange={(e) => updateConfig("geobloqueo.modo", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="bloquear_lista">Bloquear lista de países</option>
                <option value="permitir_lista">Permitir solo lista de países</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Países bloqueados <span className="text-zinc-400 font-normal">(códigos ISO, separados por coma)</span>
              </label>
              <textarea
                value={sc.geobloqueo.paises_bloqueados.join(", ")}
                onChange={(e) => updateConfig("geobloqueo.paises_bloqueados", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
                placeholder="CN, RU, KP, IR"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Países permitidos <span className="text-zinc-400 font-normal">(códigos ISO, separados por coma)</span>
              </label>
              <textarea
                value={sc.geobloqueo.paises_permitidos.join(", ")}
                onChange={(e) => updateConfig("geobloqueo.paises_permitidos", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
                placeholder="MX, CO, AR, CL"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Mensaje de bloqueo</label>
              <input
                type="text"
                value={sc.geobloqueo.mensaje_bloqueo}
                onChange={(e) => updateConfig("geobloqueo.mensaje_bloqueo", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        {/* ---- Section 2: Rate Limiting ---- */}
        <div className="card-soft rounded-[1.25rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-800">Rate Limiting</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-600">Habilitado</span>
              <Toggle value={sc.rate_limiting.habilitado} onChange={(v) => updateConfig("rate_limiting.habilitado", v)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => openRlModal(null)}
                className="flex items-center gap-1.5 bg-primary-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir regla
              </button>
              <span className="text-xs text-zinc-400">{sc.rate_limiting.reglas.length} regla(s)</span>
            </div>

            {sc.rate_limiting.reglas.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">No hay reglas definidas.</p>
            ) : (
              <div className="space-y-2">
                {sc.rate_limiting.reglas.map((rule: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-zinc-100"
                  >
                    <div className="flex items-center gap-3">
                      <Toggle value={rule.habilitado} onChange={(v) => {
                        const rules = deepClone(sc.rate_limiting.reglas);
                        rules[i].habilitado = v;
                        updateConfig("rate_limiting.reglas", rules);
                      }} />
                      <div>
                        <p className="text-sm font-semibold text-zinc-800">
                          <span className="text-xs font-mono bg-zinc-100 px-1.5 py-0.5 rounded mr-1.5">{rule.metodo}</span>
                          {rule.ruta}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {rule.limite} peticiones / {rule.ventana_segundos}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openRlModal(i)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteRlRule(i)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Mensaje de límite excedido</label>
              <input
                type="text"
                value={sc.rate_limiting.mensaje_limite}
                onChange={(e) => updateConfig("rate_limiting.mensaje_limite", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        {/* ---- Section 3: Security Headers ---- */}
        <div className="card-soft rounded-[1.25rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-800">Security Headers</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-600">Habilitado</span>
              <Toggle value={sc.security_headers.habilitado} onChange={(v) => updateConfig("security_headers.habilitado", v)} />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(sc.security_headers.headers).map(([key, header]: any) => (
              <div key={key} className="p-4 rounded-2xl bg-white/60 border border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-semibold text-zinc-700">{key}</span>
                  <Toggle value={header.habilitado} onChange={(v) => {
                    const headers = deepClone(sc.security_headers.headers);
                    headers[key].habilitado = v;
                    updateConfig("security_headers.headers", headers);
                  }} />
                </div>
                <textarea
                  value={header.valor}
                  onChange={(e) => {
                    const headers = deepClone(sc.security_headers.headers);
                    headers[key].valor = e.target.value;
                    updateConfig("security_headers.headers", headers);
                  }}
                  rows={key === "content-security-policy" ? 4 : 1}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---- Section 4: Alertas ---- */}
        <div className="card-soft rounded-[1.25rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-800">Alertas</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-600">Habilitado</span>
              <Toggle value={sc.alertas.habilitado} onChange={(v) => updateConfig("alertas.habilitado", v)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Email destino</label>
                <input
                  type="email"
                  value={sc.alertas.email_destino}
                  onChange={(e) => updateConfig("alertas.email_destino", e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="admin@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Webhook URL</label>
                <input
                  type="url"
                  value={sc.alertas.webhook_url}
                  onChange={(e) => updateConfig("alertas.webhook_url", e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="https://hooks.slack.com/..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => openAlertaModal(null)}
                className="flex items-center gap-1.5 bg-primary-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir alerta
              </button>
              <span className="text-xs text-zinc-400">{sc.alertas.reglas.length} alerta(s)</span>
            </div>

            {sc.alertas.reglas.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">No hay alertas definidas.</p>
            ) : (
              <div className="space-y-2">
                {sc.alertas.reglas.map((rule: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-zinc-100"
                  >
                    <div className="flex items-center gap-3">
                      <Toggle value={rule.habilitado} onChange={(v) => {
                        const rules = deepClone(sc.alertas.reglas);
                        rules[i].habilitado = v;
                        updateConfig("alertas.reglas", rules);
                      }} />
                      <div>
                        <p className="text-sm font-semibold text-zinc-800">{rule.nombre || "(sin nombre)"}</p>
                        <p className="text-xs text-zinc-500">
                          {rule.tipo} · {rule.nivel} · &ge; {rule.umbral} en {rule.ventana_minutos}min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAlertaModal(i)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAlertaRule(i)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Rate Limiting Rule Modal ---- */}
      {rlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRlModal(false)}>
          <div className="bg-white rounded-[1.25rem] p-6 w-full max-w-lg mx-4 shadow-2xl border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                {rlEditingIndex !== null ? "Editar regla" : "Nueva regla"}
              </h3>
              <button onClick={() => setRlModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Ruta</label>
                  <input
                    type="text"
                    value={rlForm.ruta}
                    onChange={(e) => setRlForm({ ...rlForm, ruta: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="/api/"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Método</label>
                  <select
                    value={rlForm.metodo}
                    onChange={(e) => setRlForm({ ...rlForm, metodo: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Límite</label>
                  <input
                    type="number"
                    value={rlForm.limite}
                    onChange={(e) => setRlForm({ ...rlForm, limite: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Ventana (segundos)</label>
                  <input
                    type="number"
                    value={rlForm.ventana_segundos}
                    onChange={(e) => setRlForm({ ...rlForm, ventana_segundos: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-600">Habilitado</span>
                <Toggle value={rlForm.habilitado} onChange={(v) => setRlForm({ ...rlForm, habilitado: v })} />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setRlModal(false)} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
                Cancelar
              </button>
              <button onClick={saveRlRule} className="flex-1 rounded-xl bg-primary-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                {rlEditingIndex !== null ? "Actualizar" : "Añadir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Alertas Rule Modal ---- */}
      {alertaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAlertaModal(false)}>
          <div className="bg-white rounded-[1.25rem] p-6 w-full max-w-lg mx-4 shadow-2xl border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                {alertaEditingIndex !== null ? "Editar alerta" : "Nueva alerta"}
              </h3>
              <button onClick={() => setAlertaModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={alertaForm.nombre}
                  onChange={(e) => setAlertaForm({ ...alertaForm, nombre: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Intentos fallidos de login"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Tipo</label>
                  <select
                    value={alertaForm.tipo}
                    onChange={(e) => setAlertaForm({ ...alertaForm, tipo: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="intentos_fallidos">Intentos fallidos</option>
                    <option value="rate_limit_excedido">Rate limit excedido</option>
                    <option value="geobloqueo">Geobloqueo</option>
                    <option value="sql_injection">SQL Injection</option>
                    <option value="xss">XSS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Nivel</label>
                  <select
                    value={alertaForm.nivel}
                    onChange={(e) => setAlertaForm({ ...alertaForm, nivel: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Umbral</label>
                  <input
                    type="number"
                    value={alertaForm.umbral}
                    onChange={(e) => setAlertaForm({ ...alertaForm, umbral: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Ventana (minutos)</label>
                <input
                  type="number"
                  value={alertaForm.ventana_minutos}
                  onChange={(e) => setAlertaForm({ ...alertaForm, ventana_minutos: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-600">Habilitado</span>
                <Toggle value={alertaForm.habilitado} onChange={(v) => setAlertaForm({ ...alertaForm, habilitado: v })} />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setAlertaModal(false)} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
                Cancelar
              </button>
              <button onClick={saveAlertaRule} className="flex-1 rounded-xl bg-primary-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                {alertaEditingIndex !== null ? "Actualizar" : "Añadir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
