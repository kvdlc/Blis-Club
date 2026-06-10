"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle, Wallet } from "lucide-react";
import { getCountryConfig, validateDocument, getCountryList, COUNTRY_CONFIGS } from "@/lib/billing";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: any) => void;
  existingProfile?: any | null;
}

export default function BillingProfileModal({ isOpen, onClose, onSave, existingProfile }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    country_code: "PE",
    document_type: "dni",
    document_number: "",
    city: "",
    address_line: "",
    postal_code: "",
    withdrawal_method: "binance_pay",
    binance_pay_id: "",
    binance_email: "",
    paypal_email: "",
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        full_name: existingProfile.full_name || "",
        country_code: existingProfile.country_code || "PE",
        document_type: existingProfile.document_type || "dni",
        document_number: existingProfile.document_number || "",
        city: existingProfile.city || "",
        address_line: existingProfile.address_line || "",
        postal_code: existingProfile.postal_code || "",
        withdrawal_method: existingProfile.withdrawal_method || "binance_pay",
        binance_pay_id: existingProfile.binance_pay_id || "",
        binance_email: existingProfile.binance_email || "",
        paypal_email: existingProfile.paypal_email || "",
      });
    }
  }, [existingProfile]);

  const countryConfig = getCountryConfig(form.country_code);
  const countries = getCountryList();

  function validateStep1(): boolean {
    if (!form.full_name || form.full_name.trim().length < 3) {
      setValidationError("Nombre completo requerido (mínimo 3 caracteres)");
      return false;
    }
    const docValidation = validateDocument(form.country_code, form.document_type, form.document_number);
    if (!docValidation.valid) {
      setValidationError(docValidation.error || "Documento inválido");
      return false;
    }
    setValidationError("");
    return true;
  }

  function validateStep2(): boolean {
    if (form.withdrawal_method === "binance_pay") {
      const hasId = !!form.binance_pay_id?.trim();
      const hasEmail = !!form.binance_email?.trim();
      if (!hasId && !hasEmail) {
        setValidationError("Debes proporcionar tu Binance Pay ID o email de Binance");
        return false;
      }
      if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.binance_email)) {
        setValidationError("Email de Binance inválido");
        return false;
      }
    }
    if (form.withdrawal_method === "paypal") {
      if (!form.paypal_email?.trim()) {
        setValidationError("Email de PayPal requerido");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypal_email)) {
        setValidationError("Email de PayPal inválido");
        return false;
      }
    }
    setValidationError("");
    return true;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      const url = existingProfile ? "/api/billing-profile" : "/api/billing-profile";
      const method = existingProfile ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }

      onSave(data.profile);
      onClose();
      setStep(1);
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="font-bold text-zinc-900 text-sm">
              {existingProfile ? "Editar perfil de facturación" : "Perfil de facturación"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-4 pt-4">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary-500" : "bg-zinc-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary-500" : "bg-zinc-200"}`} />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 text-danger-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-50 text-warning-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {validationError}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">País</label>
                <select
                  value={form.country_code}
                  onChange={(e) => {
                    const code = e.target.value;
                    const config = getCountryConfig(code);
                    setForm({
                      ...form,
                      country_code: code,
                      document_type: config.documentTypes[0].value,
                    });
                  }}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Nombre completo (según documento)</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Juan Pérez García"
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1">Tipo de documento</label>
                  <select
                    value={form.document_type}
                    onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                  >
                    {countryConfig.documentTypes.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1">Número</label>
                  <input
                    type="text"
                    value={form.document_number}
                    onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                    placeholder={countryConfig.documentTypes.find(d => d.value === form.document_type)?.example}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Ciudad (opcional)</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Dirección (opcional)</label>
                <input
                  type="text"
                  value={form.address_line}
                  onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                />
              </div>

              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-2">Método de retiro</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setForm({ ...form, withdrawal_method: "binance_pay" })}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${ form.withdrawal_method === "binance_pay" ? "border-primary-500 bg-primary-50" : "border-zinc-200 hover:border-zinc-300" }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-zinc-900">Binance Pay</p>
                        <p className="text-[10px] text-zinc-500">ID de Binance o email</p>
                      </div>
                      <span className="text-[10px] font-bold bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">0% fee</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setForm({ ...form, withdrawal_method: "paypal" })}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${ form.withdrawal_method === "paypal" ? "border-primary-500 bg-primary-50" : "border-zinc-200 hover:border-zinc-300" }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-zinc-900">PayPal</p>
                        <p className="text-[10px] text-zinc-500">Email de PayPal</p>
                      </div>
                      <span className="text-[10px] font-bold bg-warning-100 text-warning-700 px-2 py-1 rounded-full">5% fee</span>
                    </div>
                  </button>
                </div>
              </div>

              {form.withdrawal_method === "binance_pay" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 block mb-1">Binance Pay ID</label>
                    <input
                      type="text"
                      value={form.binance_pay_id}
                      onChange={(e) => setForm({ ...form, binance_pay_id: e.target.value })}
                      placeholder="Obligatorio si no pones email"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="text-center text-xs text-zinc-400">— o —</div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 block mb-1">Email de Binance</label>
                    <input
                      type="email"
                      value={form.binance_email}
                      onChange={(e) => setForm({ ...form, binance_email: e.target.value })}
                      placeholder="usuario@binance.com"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
              )}

              {form.withdrawal_method === "paypal" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1">Email de PayPal</label>
                  <input
                    type="email"
                    value={form.paypal_email}
                    onChange={(e) => setForm({ ...form, paypal_email: e.target.value })}
                    placeholder="paypal@email.com"
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-zinc-200 py-3 font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : <><Check className="w-4 h-4" /> Guardar</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
