"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { createClient } from "@/lib/supabase/client";
import { createServiceClient } from "@/lib/supabase/service";
import { Mail, Plus, Edit, Trash2, Save, X, Send, ToggleLeft, ToggleRight, TestTube } from "lucide-react";

const TABS = [
  { key: "templates", label: "Plantillas" },
  { key: "senders", label: "Remitentes" },
  { key: "test", label: "Probar Email" },
];

const EVENT_OPTIONS = [
  { value: "bienvenida", label: "Bienvenida" },
  { value: "pago_confirmado", label: "Pago Confirmado" },
  { value: "pago_vencido", label: "Suscripción por Vencer" },
  { value: "suscripcion_expirada", label: "Suscripción Expirada" },
  { value: "restablecer_password", label: "Restablecer Contraseña" },
  { value: "commission_available", label: "Comisión Disponible" },
  { value: "withdrawal_requested", label: "Retiro Solicitado" },
  { value: "withdrawal_completed", label: "Retiro Completado" },
];

export default function EmailPage() {
  const [tab, setTab] = useState("templates");
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState<any[]>([]);
  const [senders, setSenders] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [senderConfig, setSenderConfig] = useState<Record<string, string>>({});

  const [testEmail, setTestEmail] = useState("");
  const [testEvento, setTestEvento] = useState("bienvenida");
  const [testStatus, setTestStatus] = useState("");

  const supabase = createClient();

  const loadTemplates = async () => {
    const { data } = await supabase.from("email_templates").select("*").order("nombre");
    setTemplates(data || []);
  };

  const loadSenders = async () => {
    const { data } = await supabase.from("email_senders").select("*").order("nombre");
    setSenders(data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTemplates(), loadSenders()]);
      setLoading(false);
    };
    load();
  }, []);

  const resetTemplateForm = () => {
    setForm({ nombre: "", evento: "", subject: "", html_body: "" });
    setEditing(null);
    setShowForm(true);
  };

  const resetSenderForm = () => {
    setForm({ nombre: "", provider: "smtp", from_email: "hola@blis.club", is_default: "false" });
    setSenderConfig({ smtp_host: "", smtp_port: "465", smtp_user: "", smtp_pass: "", from_name: "Blis Club", from_email: "hola@blis.club" });
    setEditing(null);
    setShowForm(true);
  };

  const handleSaveTemplate = async () => {
    const serviceClient = createServiceClient();
    const row: Record<string, unknown> = {
      nombre: form.nombre,
      evento: form.evento,
      subject: form.subject,
      html_body: form.html_body,
    };
    if (editing) {
      await serviceClient.from("email_templates").update(row).eq("id", editing.id);
    } else {
      const appIdRow = await serviceClient.from("applications").select("id").eq("slug", "guau").maybeSingle();
      if (appIdRow?.data) row.application_id = appIdRow.data.id;
      await serviceClient.from("email_templates").insert(row);
    }
    setShowForm(false);
    setEditing(null);
    loadTemplates();
  };

  const handleSaveSender = async () => {
    const serviceClient = createServiceClient();
    const configObj: Record<string, string> = {};
    if (form.provider === "smtp") {
      if (senderConfig.smtp_host) configObj.smtp_host = senderConfig.smtp_host;
      if (senderConfig.smtp_port) configObj.smtp_port = senderConfig.smtp_port;
      if (senderConfig.smtp_user) configObj.smtp_user = senderConfig.smtp_user;
      if (senderConfig.smtp_pass) configObj.smtp_pass = senderConfig.smtp_pass;
      if (senderConfig.from_name) configObj.from_name = senderConfig.from_name;
      if (senderConfig.from_email) configObj.from_email = senderConfig.from_email;
    } else if (senderConfig.api_key) {
      configObj.api_key = senderConfig.api_key;
      if (senderConfig.from_name) configObj.from_name = senderConfig.from_name;
      if (senderConfig.from_email) configObj.from_email = senderConfig.from_email;
    }

    const row: Record<string, unknown> = {
      nombre: form.nombre,
      provider: form.provider,
      is_default: form.is_default === "true",
      config: configObj,
    };

    if (editing) {
      await serviceClient.from("email_senders").update(row).eq("id", editing.id);
    } else {
      const appIdRow2 = await serviceClient.from("applications").select("id").eq("slug", "guau").maybeSingle();
      if (appIdRow2?.data) row.application_id = appIdRow2.data.id;
      await serviceClient.from("email_senders").insert(row);
    }
    setShowForm(false);
    setEditing(null);
    loadSenders();
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const serviceClient = createServiceClient();
    await serviceClient.from(table).delete().eq("id", id);
    if (table === "email_templates") loadTemplates();
    else if (table === "email_senders") loadSenders();
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEvento) return;
    setTestStatus("Enviando...");
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail, evento: testEvento }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus(`Email enviado a ${testEmail}`);
      } else {
        setTestStatus(`Error: ${data.error || "No se pudo enviar"}`);
      }
    } catch {
      setTestStatus("Error de conexión");
    }
    setTimeout(() => setTestStatus(""), 5000);
  };

  const editTemplate = (t: any) => {
    setForm({
      nombre: t.nombre || "",
      evento: t.evento || "",
      subject: t.subject || "",
      html_body: t.html_body || "",
    });
    setEditing(t);
    setShowForm(true);
  };

  const editSender = (s: any) => {
    const cfg = (s.config as Record<string, string>) || {};
    setForm({
      nombre: s.nombre || "",
      provider: s.provider || "smtp",
      is_default: s.is_default ? "true" : "false",
    });
    if (s.provider === "smtp") {
      setSenderConfig({
        smtp_host: cfg.smtp_host || "",
        smtp_port: cfg.smtp_port || "465",
        smtp_user: cfg.smtp_user || "",
        smtp_pass: cfg.smtp_pass || "",
        from_name: cfg.from_name || "Blis Club",
        from_email: cfg.from_email || s.email || "hola@blis.club",
      });
    } else {
      setSenderConfig({
        api_key: cfg.api_key || "",
        from_name: cfg.from_name || "Blis Club",
        from_email: cfg.from_email || s.email || "hola@blis.club",
      });
    }
    setEditing(s);
    setShowForm(true);
  };

  const renderTabContent = () => {
    if (loading) return <div className="text-center py-12 text-zinc-500">Cargando...</div>;

    switch (tab) {
      case "templates":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">Plantillas de Email</h2>
              <button onClick={resetTemplateForm} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                <Plus className="w-4 h-4" /> Nueva Plantilla
              </button>
            </div>

            {(showForm || editing) && tab === "templates" && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-800">{editing ? "Editar" : "Nueva"} Plantilla</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Nombre</label>
                    <input value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Ej: Bienvenida" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Evento</label>
                    <select value={form.evento || ""} onChange={(e) => setForm({ ...form, evento: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                      <option value="">— Seleccionar evento —</option>
                      {EVENT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Asunto</label>
                  <input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Ej: ¡Bienvenido a Blis Club!" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">HTML Body</label>
                  <textarea value={form.html_body || ""} onChange={(e) => setForm({ ...form, html_body: e.target.value })} rows={8} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="&lt;div&gt;...&lt;/div&gt;" />
                  <p className="text-xs text-zinc-400 mt-1">Variables disponibles: {`{{nombre}}`}, {`{{email}}`}, {`{{password}}`}, {`{{display_name}}`}</p>
                </div>
                <button onClick={handleSaveTemplate} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                  <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {templates.map((t) => (
                <div key={t.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-800">{t.nombre}</p>
                    <p className="text-sm text-zinc-500 truncate">{t.subject || "Sin asunto"} · Evento: {t.evento || "—"}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">{t.evento || "sin evento"}</span>
                  <div className="flex gap-1">
                    <button onClick={() => editTemplate(t)} className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete("email_templates", t.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">No hay plantillas. Crea una para personalizar los correos.</p>}
            </div>
          </div>
        );

      case "senders":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">Remitentes de Email</h2>
              <button onClick={resetSenderForm} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                <Plus className="w-4 h-4" /> Nuevo Remitente
              </button>
            </div>

            {(showForm || editing) && tab === "senders" && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-800">{editing ? "Editar" : "Nuevo"} Remitente</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Nombre</label>
                    <input value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Ej: Asura Hosting SMTP" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Proveedor</label>
                    <select value={form.provider || "smtp"} onChange={(e) => { setForm({ ...form, provider: e.target.value }); setSenderConfig(e.target.value === "smtp" ? { smtp_host: "", smtp_port: "465", smtp_user: "", smtp_pass: "", from_name: "Blis Club", from_email: "hola@blis.club" } : { api_key: "", from_name: "Blis Club", from_email: "hola@blis.club" }); }} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                      <option value="smtp">SMTP</option>
                      <option value="resend">Resend</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setForm({ ...form, is_default: form.is_default === "true" ? "false" : "true" })} className="flex items-center gap-2 text-sm text-zinc-600">
                    {form.is_default === "true" ? <ToggleRight className="w-5 h-5 text-secondary-500" /> : <ToggleLeft className="w-5 h-5 text-zinc-400" />}
                    {form.is_default === "true" ? "Remitente principal" : "No es principal"}
                  </button>
                </div>

                {form.provider === "smtp" && (
                  <div className="space-y-3 p-4 bg-zinc-50 rounded-xl">
                    <p className="text-sm font-semibold text-zinc-700">Configuración SMTP</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Host SMTP</label>
                        <input value={senderConfig.smtp_host || ""} onChange={(e) => setSenderConfig({ ...senderConfig, smtp_host: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="smtp.ejemplo.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Puerto</label>
                        <input value={senderConfig.smtp_port || "465"} onChange={(e) => setSenderConfig({ ...senderConfig, smtp_port: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="465" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Usuario SMTP</label>
                        <input value={senderConfig.smtp_user || ""} onChange={(e) => setSenderConfig({ ...senderConfig, smtp_user: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="hola@blis.club" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Contraseña SMTP</label>
                        <input type="password" value={senderConfig.smtp_pass || ""} onChange={(e) => setSenderConfig({ ...senderConfig, smtp_pass: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Nombre remitente</label>
                        <input value={senderConfig.from_name || ""} onChange={(e) => setSenderConfig({ ...senderConfig, from_name: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="Blis Club" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Email remitente</label>
                        <input value={senderConfig.from_email || ""} onChange={(e) => setSenderConfig({ ...senderConfig, from_email: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="hola@blis.club" />
                      </div>
                    </div>
                  </div>
                )}

                {(form.provider === "resend" || form.provider === "sendgrid") && (
                  <div className="space-y-3 p-4 bg-zinc-50 rounded-xl">
                    <p className="text-sm font-semibold text-zinc-700">API Key</p>
                    <input value={senderConfig.api_key || ""} onChange={(e) => setSenderConfig({ ...senderConfig, api_key: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="re_xxx o SG.xxx" />
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Nombre remitente</label>
                        <input value={senderConfig.from_name || ""} onChange={(e) => setSenderConfig({ ...senderConfig, from_name: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="Blis Club" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Email remitente</label>
                        <input value={senderConfig.from_email || ""} onChange={(e) => setSenderConfig({ ...senderConfig, from_email: e.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="hola@blis.club" />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleSaveSender} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                  <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {senders.map((s) => {
                const cfg = (s.config as Record<string, string>) || {};
                const providerLabel = ({ smtp: "SMTP", resend: "Resend", sendgrid: "SendGrid" } as Record<string, string>)[s.provider] || s.provider;
                const detail = s.provider === "smtp" ? (cfg.smtp_host || "—") : (cfg.api_key ? "API key configurada" : "—");
                return (
                  <div key={s.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center text-secondary-600">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-zinc-800">{s.nombre}</p>
                      <p className="text-sm text-zinc-500 truncate">{providerLabel} · {cfg.from_email || s.email || detail}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.is_default ? "bg-secondary-100 text-secondary-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {s.is_default ? "Principal" : "—"}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => editSender(s)} className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete("email_senders", s.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {senders.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">No hay remitentes</p>}
            </div>
          </div>
        );

      case "test":
        return (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-800">Probar Envío de Email</h2>
            <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Destinatario</label>
                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="tu@email.com"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Tipo de email</label>
                <select value={testEvento} onChange={(e) => setTestEvento(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  {EVENT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSendTest} disabled={!testEmail}
                  className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" /> Enviar Email de Prueba
                </button>
                {testStatus && (
                  <span className={`text-sm ${testStatus.includes("Error") ? "text-red-600" : "text-secondary-600"}`}>
                    {testStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-2">Usa el remitente principal configurado arriba. Variables de ejemplo serán rellenadas automáticamente.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Email</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona plantillas y remitentes de email</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-zinc-200 pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowForm(false); setEditing(null); }}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${tab === t.key ? "bg-primary-600 text-white" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </AdminGuard>
  );
}