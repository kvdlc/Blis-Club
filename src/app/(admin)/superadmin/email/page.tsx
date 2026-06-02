"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { createClient } from "@/lib/supabase/client";
import { Mail, Plus, Edit, Trash2, Save, X, Send, ToggleLeft, ToggleRight } from "lucide-react";

const TABS = [
  { key: "templates", label: "Templates" },
  { key: "senders", label: "Remitentes" },
  { key: "campaigns", label: "Campañas" },
  { key: "test", label: "Test" },
];

export default function EmailPage() {
  const [tab, setTab] = useState("templates");
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState<any[]>([]);
  const [senders, setSenders] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const [testForm, setTestForm] = useState({ to: "", subject: "", body: "" });
  const [testStatus, setTestStatus] = useState("");

  const supabase = createClient();

  const loadTemplates = async () => {
    const { data } = await supabase.from("email_templates").select("*").order("name");
    setTemplates(data || []);
  };

  const loadSenders = async () => {
    const { data } = await supabase.from("email_senders").select("*").order("name");
    setSenders(data || []);
  };

  const loadCampaigns = async () => {
    const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTemplates(), loadSenders(), loadCampaigns()]);
      setLoading(false);
    };
    load();
  }, []);

  const resetForm = (fields: Record<string, string>) => {
    setForm(fields);
    setEditing(null);
    setShowForm(true);
  };

  const handleSaveTemplate = async () => {
    if (editing) {
      await supabase.from("email_templates").update(form).eq("id", editing.id);
    } else {
      await supabase.from("email_templates").insert(form);
    }
    setShowForm(false);
    setEditing(null);
    loadTemplates();
  };

  const handleSaveSender = async () => {
    if (editing) {
      await supabase.from("email_senders").update(form).eq("id", editing.id);
    } else {
      await supabase.from("email_senders").insert(form);
    }
    setShowForm(false);
    setEditing(null);
    loadSenders();
  };

  const handleSaveCampaign = async () => {
    if (editing) {
      await supabase.from("email_campaigns").update(form).eq("id", editing.id);
    } else {
      await supabase.from("email_campaigns").insert(form);
    }
    setShowForm(false);
    setEditing(null);
    loadCampaigns();
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await supabase.from(table).delete().eq("id", id);
    if (table === "email_templates") loadTemplates();
    else if (table === "email_senders") loadSenders();
    else if (table === "email_campaigns") loadCampaigns();
  };

  const handleSendTest = async () => {
    setTestStatus("Enviando...");
    await new Promise((r) => setTimeout(r, 1500));
    setTestStatus("Email simulado enviado correctamente.");
    setTimeout(() => setTestStatus(""), 3000);
  };

  const renderTabContent = () => {
    if (loading) return <div className="text-center py-12 text-zinc-500">Cargando...</div>;

    switch (tab) {
      case "templates":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Templates de Email</h2>
              <button
                onClick={() => resetForm({ name: "", evento: "", subject: "", html_body: "" })}
                className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Plus className="w-4 h-4" /> Nuevo
              </button>
            </div>

            {(showForm || editing) && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{editing ? "Editar" : "Nuevo"} Template</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                    <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Evento</label>
                    <input value={form.evento || ""} onChange={(e) => setForm({ ...form, evento: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Subject</label>
                  <input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">HTML Body</label>
                  <textarea value={form.html_body || ""} onChange={(e) => setForm({ ...form, html_body: e.target.value })} rows={4} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <button onClick={handleSaveTemplate} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                  <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {templates.map((t) => (
                <div key={t.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{t.name}</p>
                    <p className="text-sm text-zinc-500 truncate">Evento: {t.evento || "—"}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">{t.evento || "sin evento"}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(t); setForm({ name: t.name || "", evento: t.evento || "", subject: t.subject || "", html_body: t.html_body || "" }); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete("email_templates", t.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">No hay templates</p>}
            </div>
          </div>
        );

      case "senders":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Remitentes de Email</h2>
              <button
                onClick={() => resetForm({ name: "", provider: "", email: "", is_default: "false" })}
                className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Plus className="w-4 h-4" /> Nuevo
              </button>
            </div>

            {(showForm || editing) && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{editing ? "Editar" : "Nuevo"} Remitente</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                    <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Proveedor</label>
                    <select value={form.provider || "sendgrid"} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                      <option value="sendgrid">SendGrid</option>
                      <option value="resend">Resend</option>
                      <option value="smtp">SMTP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Email</label>
                    <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm({ ...form, is_default: form.is_default === "true" ? "false" : "true" })}
                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {form.is_default === "true" ? <ToggleRight className="w-5 h-5 text-secondary-500" /> : <ToggleLeft className="w-5 h-5 text-zinc-400" />}
                    {form.is_default === "true" ? "Default" : "No default"}
                  </button>
                </div>
                <button onClick={handleSaveSender} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                  <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {senders.map((s) => (
                <div key={s.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-secondary-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{s.name}</p>
                    <p className="text-sm text-zinc-500 truncate">{s.provider || "—"} · {s.email || "—"}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.is_default ? "bg-secondary-100 text-secondary-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {s.is_default ? "Default" : "—"}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(s); setForm({ name: s.name || "", provider: s.provider || "", email: s.email || "", is_default: s.is_default ? "true" : "false" }); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete("email_senders", s.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {senders.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">No hay remitentes</p>}
            </div>
          </div>
        );

      case "campaigns":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Campañas de Email</h2>
              <button
                onClick={() => resetForm({ name: "", template_id: "", sender_id: "", subject: "" })}
                className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Plus className="w-4 h-4" /> Nueva Campaña
              </button>
            </div>

            {(showForm || editing) && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{editing ? "Editar" : "Nueva"} Campaña</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                    <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Subject</label>
                    <input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>
                <button onClick={handleSaveCampaign} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
                  <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {campaigns.map((c) => (
                <div key={c.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-warning-100 dark:bg-warning-950 flex items-center justify-center text-warning-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{c.name || "—"}</p>
                    <p className="text-sm text-zinc-500 truncate">{c.subject || "Sin asunto"} · {c.created_at ? new Date(c.created_at).toLocaleDateString("es-ES") : "—"}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                    {c.status || "draft"}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete("email_campaigns", c.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">No hay campañas</p>}
            </div>
          </div>
        );

      case "test":
        return (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Enviar Email de Prueba</h2>
            <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Para (Email)</label>
                <input type="email" value={testForm.to} onChange={(e) => setTestForm({ ...testForm, to: e.target.value })} placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Asunto</label>
                <input value={testForm.subject} onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })} placeholder="Asunto del email"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Cuerpo</label>
                <textarea value={testForm.body} onChange={(e) => setTestForm({ ...testForm, body: e.target.value })} rows={4} placeholder="Contenido del email..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSendTest}
                  disabled={!testForm.to || !testForm.subject}
                  className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" /> Enviar Test
                </button>
                {testStatus && (
                  <span className={`text-sm ${testStatus.includes("correctamente") ? "text-secondary-600" : "text-zinc-500"}`}>
                    {testStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-2">Simula el envío sin despachar realmente (no se conecta a ningún proveedor real).</p>
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
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Email</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona templates, remitentes y campañas de email</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowForm(false); setEditing(null); }}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
                tab === t.key
                  ? "bg-primary-600 text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
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
