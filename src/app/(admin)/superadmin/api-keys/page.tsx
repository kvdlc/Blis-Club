"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Save, X, Key, Shield, Globe, Cloud, CreditCard, Eye, EyeOff, Copy, Check } from "lucide-react";

interface ApiKeyRow {
  id: string;
  key_name: string;
  key_value: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

const KEY_DESCRIPTIONS: Record<string, { description: string; category: string; label: string }> = {
  izipay_shop_id:          { category: "Pagos", label: "Shop ID", description: "Identificador de tienda en Micuentaveb (Usuario)" },
  izipay_secret_key:       { category: "Pagos", label: "Secret Key", description: "Contraseña de test o producción para autenticación Basic Auth" },
  izipay_public_key:       { category: "Pagos", label: "Public Key", description: "Clave pública para el SDK JavaScript de Krypton" },
  izipay_hmac_key:         { category: "Pagos", label: "HMAC Key", description: "Clave HMAC-SHA-256 para verificar firmas de webhooks IPN" },
  izipay_environment:      { category: "Pagos", label: "Entorno", description: "sandbox (pruebas) o production (real)" },
  izipay_display_mode:     { category: "Pagos", label: "Modo de visualización", description: "popup (ventana emergente) o embedded (formulario inline)" },
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Pagos": CreditCard,
  "IA": Cloud,
};

const PREDEFINED_KEYS = [
  "izipay_shop_id",
  "izipay_secret_key",
  "izipay_public_key",
  "izipay_hmac_key",
  "izipay_environment",
  "izipay_display_mode",
];

function getCategory(keyName: string): string {
  return KEY_DESCRIPTIONS[keyName]?.category || "General";
}

function getLabel(keyName: string): string {
  return KEY_DESCRIPTIONS[keyName]?.label || keyName;
}

function getDescription(keyName: string): string {
  return KEY_DESCRIPTIONS[keyName]?.description || "";
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ keyName: string; value: string; isNew: boolean } | null>(null);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadKeys = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/api-keys");
    const json = await res.json();
    setKeys(json.data || []);
    setLoading(false);
  };

  useEffect(() => { loadKeys(); }, []);

  const handleSaveKey = async () => {
    if (!editModal || editModal.value === undefined) return;
    setSaving(editModal.keyName);
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_name: editModal.keyName, key_value: editModal.value }),
    });
    if (res.ok) {
      await loadKeys();
      setEditModal(null);
    }
    setSaving(null);
  };

  const handleDelete = async (keyName: string) => {
    setDeleteConfirm(null);
    await fetch(`/api/admin/api-keys?key_name=${encodeURIComponent(keyName)}`, { method: "DELETE" });
    await loadKeys();
  };

  const toggleShow = (keyName: string) => {
    setShowValues((prev) => {
      const next = new Set(prev);
      if (next.has(keyName)) next.delete(keyName);
      else next.add(keyName);
      return next;
    });
  };

  const copyValue = async (keyName: string) => {
    const fullRes = await fetch(`/api/admin/api-keys/value?key=${encodeURIComponent(keyName)}`);
    if (fullRes.ok) {
      const json = await fullRes.json();
      await navigator.clipboard.writeText(json.value || "");
      setCopied(keyName);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const grouped = keys.reduce<Record<string, ApiKeyRow[]>>((acc, key) => {
    const cat = getCategory(key.key_name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(key);
    return acc;
  }, {});

  const predefinedMissing = PREDEFINED_KEYS.filter(
    (pk) => !keys.find((k) => k.key_name === pk)
  );

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-center py-12 text-zinc-500">Cargando claves API...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Claves API</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona credenciales de servicios externos (IziPay, IA, etc.)</p>
          </div>
        </div>

        {/* Predefined keys not yet configured */}
        {predefinedMissing.length > 0 && (
          <div className="card-soft rounded-[1.25rem] p-5 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">Claves pendientes de configurar</p>
            <div className="flex flex-wrap gap-2">
              {predefinedMissing.map((keyName) => (
                <button
                  key={keyName}
                  onClick={() => setEditModal({ keyName, value: "", isNew: true })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {getLabel(keyName)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grouped keys */}
        {Object.entries(grouped).map(([category, categoryKeys]) => {
          const Icon = CATEGORY_ICONS[category] || Key;
          return (
            <div key={category} className="card-soft rounded-[1.25rem] overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{category}</h2>
                  <p className="text-[11px] text-zinc-400">{categoryKeys.length} clave(s)</p>
                </div>
              </div>

              <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {categoryKeys.map((key) => (
                  <div key={key.id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{getLabel(key.key_name)}</p>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">{key.key_name}</code>
                      </div>
                      {getDescription(key.key_name) && (
                        <p className="text-xs text-zinc-400 mb-1">{getDescription(key.key_name)}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                            {key.key_value}
                          </span>
                          <button onClick={() => copyValue(key.key_name)} className="text-zinc-400 hover:text-primary-500 transition-colors">
                            {copied === key.key_name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {key.updated_at ? new Date(key.updated_at).toLocaleDateString("es-PE") : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditModal({ keyName: key.key_name, value: "", isNew: false })}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(key.key_name)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {keys.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <Key className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
            <p className="font-semibold">No hay claves API configuradas</p>
            <p className="text-sm mt-1">Agrega las claves necesarias usando los botones superiores.</p>
          </div>
        )}

        {/* Add custom key */}
        <div className="card-soft rounded-[1.25rem] p-6">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Agregar clave personalizada</h2>
          <button
            onClick={() => setEditModal({ keyName: "", value: "", isNew: true })}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            <Plus className="w-4 h-4" /> Nueva clave
          </button>
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditModal(null)}>
            <div
              className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-6 w-full max-w-md mx-4 shadow-2xl border border-zinc-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {editModal.isNew ? "Nueva clave" : `Editar ${getLabel(editModal.keyName)}`}
                </h3>
                <button onClick={() => setEditModal(null)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {editModal.isNew && (
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre de la clave</label>
                    <input
                      type="text"
                      value={editModal.keyName}
                      onChange={(e) => setEditModal({ ...editModal, keyName: e.target.value })}
                      placeholder="ej: mi_api_key"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                )}

                {!editModal.isNew && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <code className="text-xs text-zinc-500 font-mono">{editModal.keyName}</code>
                    {getDescription(editModal.keyName) && (
                      <span className="text-xs text-zinc-400">— {getDescription(editModal.keyName)}</span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Valor</label>
                  <input
                    type="text"
                    value={editModal.value}
                    onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                    placeholder="Ingresa el valor de la clave"
                    autoFocus
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-5 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveKey}
                  disabled={saving === editModal.keyName || !editModal.keyName || !editModal.value}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving === editModal.keyName ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div
              className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-6 w-full max-w-sm mx-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Eliminar clave</h3>
              <p className="text-sm text-zinc-500 mb-5">
                ¿Estás seguro de eliminar <code className="text-zinc-700 dark:text-zinc-300 font-mono">{deleteConfirm}</code>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
