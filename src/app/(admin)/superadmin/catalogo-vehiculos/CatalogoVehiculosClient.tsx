"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { correctionToCatalogField } from "@/lib/catalog";
import { Plus, Trash2, BadgeCheck, ShieldQuestion, Check, X } from "lucide-react";

interface Make {
  id: string;
  nombre: string;
  slug: string;
  logo_url?: string | null;
  models: { id: string; nombre: string; slug: string; tipo_vehiculo: string }[];
}

interface Spec {
  id: string;
  año: number | null;
  motor_nombre: string | null;
  tipo_combustible: string;
  capacidad_tanque_l: number | null;
  bateria_kwh: number | null;
  autonomia_km: number | null;
  aceite_viscosidad: string | null;
  psi_delante: number | null;
  psi_atras: number | null;
  octanaje_sugerido: string | null;
  verified: boolean;
  model: { nombre: string; slug: string; make_id: string } | null;
}

interface Correction {
  id: string;
  catalog_spec_id: string | null;
  campo: string;
  valor_catalogo: string | null;
  valor_usuario: string | null;
  created_at: string;
  model: { model: { nombre: string } | null } | null;
}

export default function CatalogoVehiculosClient({ makes, specs, corrections }: { makes: Make[]; specs: Spec[]; corrections: Correction[] }) {
  const [makesState, setMakesState] = useState<Make[]>(makes);
  const [specsState, setSpecsState] = useState<Spec[]>(specs);
  const [correctionsState, setCorrectionsState] = useState<Correction[]>(corrections);
  const [addingMake, setAddingMake] = useState(false);
  const [newMake, setNewMake] = useState("");

  const makeIdByName = (name: string) => makesState.find((m) => m.nombre === name)?.id;

  const handleAddMake = async () => {
    if (!newMake.trim()) return;
    const supabase = createClient();
    const slug = newMake.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data, error } = await supabase
      .from("vehicle_catalog_makes")
      .insert({ nombre: newMake.trim(), slug })
      .select()
      .single();
    if (!error && data) {
      setMakesState([...makesState, { ...data, models: [] }]);
      setNewMake("");
      setAddingMake(false);
    } else if (error) {
      alert("Error: " + error.message);
    }
  };

  const handleToggleVerified = async (spec: Spec) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("vehicle_catalog_specs")
      .update({ verified: !spec.verified })
      .eq("id", spec.id);
    if (!error) {
      setSpecsState(specsState.map((s) => (s.id === spec.id ? { ...s, verified: !s.verified } : s)));
    }
  };

  const handleDeleteSpec = async (id: string) => {
    if (!confirm("¿Eliminar esta especificación?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("vehicle_catalog_specs").delete().eq("id", id);
    if (!error) setSpecsState(specsState.filter((s) => s.id !== id));
  };

  const handleApproveCorrection = async (corr: Correction) => {
    const supabase = createClient();
    if (corr.catalog_spec_id) {
      const mapping = correctionToCatalogField(corr.campo, corr.valor_usuario);
      if (mapping) {
        await supabase.from("vehicle_catalog_specs").update({ [mapping.field]: mapping.value }).eq("id", corr.catalog_spec_id);
      }
    }
    await supabase.from("spec_corrections").update({ status: "approved" }).eq("id", corr.id);
    setCorrectionsState(correctionsState.filter((c) => c.id !== corr.id));
  };

  const handleRejectCorrection = async (id: string) => {
    const supabase = createClient();
    await supabase.from("spec_corrections").update({ status: "rejected" }).eq("id", id);
    setCorrectionsState(correctionsState.filter((c) => c.id !== id));
  };

  const totalModels = makesState.reduce((s, m) => s + m.models.length, 0);
  const totalVerified = specsState.filter((s) => s.verified).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800">Catálogo de Vehículos</h1>
          <p className="text-sm text-zinc-500">{makesState.length} marcas · {totalModels} modelos · {specsState.length} specs ({totalVerified} verificadas)</p>
        </div>
        <button onClick={() => setAddingMake(!addingMake)} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Agregar marca
        </button>
      </div>

      {addingMake && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex gap-2">
          <input value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="Nombre de la marca"
            className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
          <button onClick={handleAddMake} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold">Guardar</button>
        </div>
      )}

      {/* Correcciones pendientes */}
      {correctionsState.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-zinc-800 mb-2">Correcciones de usuarios ({correctionsState.length})</h2>
          <p className="text-xs text-zinc-500 mb-3">Los usuarios indicaron valores distintos al catálogo. Revisa y promueve los correctos.</p>
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Modelo</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Campo</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Catálogo</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Usuario</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-zinc-500">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {correctionsState.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-3 py-2 text-xs text-zinc-600">{c.model?.model?.nombre || "—"}</td>
                      <td className="px-3 py-2 text-xs text-zinc-600">{c.campo.replace(/_/g, " ")}</td>
                      <td className="px-3 py-2 text-xs text-zinc-400 line-through">{c.valor_catalogo || "—"}</td>
                      <td className="px-3 py-2 text-xs font-bold text-zinc-800">{c.valor_usuario || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleApproveCorrection(c)} title="Promover al catálogo"
                            className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-zinc-400 hover:text-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRejectCorrection(c.id)} title="Descartar"
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Marcas y modelos */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Modelos</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {makesState.map((m) => (
                <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.logo_url ? (
                        <img src={m.logo_url} alt={m.nombre} className="h-6 w-auto max-w-[72px] object-contain bg-white rounded px-0.5"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {m.nombre.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-zinc-800">{m.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {m.models.length > 0 ? m.models.map((mod) => mod.nombre).join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-zinc-500">
                      {[...new Set(m.models.map((mod) => mod.tipo_vehiculo))].join(", ") || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Especificaciones */}
      <div>
        <h2 className="text-lg font-bold text-zinc-800 mb-2">Especificaciones ({specsState.length})</h2>
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Modelo</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Versión</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Tanque/Batería</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Aceite</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">PSI</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Octanaje</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-zinc-500">Estado</th>
                  <th className="text-right px-3 py-2 text-xs font-bold text-zinc-500">Acción</th>
                </tr>
              </thead>
              <tbody>
                {specsState.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-3 py-2 font-bold text-zinc-800">{s.model?.nombre || "—"}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">{s.año || "—"} · {s.motor_nombre || "N/D"} · {s.tipo_combustible}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">
                      {s.bateria_kwh ? `${s.bateria_kwh} kWh · ${s.autonomia_km ?? "?"} km` : (s.capacidad_tanque_l ? `${s.capacidad_tanque_l} L` : "—")}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-600">{s.aceite_viscosidad || "—"}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">{s.psi_delante ? `${s.psi_delante}/${s.psi_atras}` : "—"}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">{s.octanaje_sugerido || "—"}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleToggleVerified(s)} className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${s.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.verified ? <BadgeCheck className="w-3 h-3" /> : <ShieldQuestion className="w-3 h-3" />}
                        {s.verified ? "Verificado" : "Referencia"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => handleDeleteSpec(s.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {specsState.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-zinc-400">Sin especificaciones</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
