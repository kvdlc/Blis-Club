"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, RotateCcw, Droplets, Car, Lightbulb, Shield } from "lucide-react";

interface Defaults {
  presionDelante: number | null;
  presionAtras: number | null;
  presionRepuesto: number | null;
}

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  detail?: string;
}

const checklistData: ChecklistItem[] = [
  // Fluidos
  { id: "aceite_motor", label: "Nivel de aceite del motor", category: "fluidos", detail: "Entre MIN y MAX en la varilla, color ámbar (no negro)" },
  { id: "refrigerante", label: "Nivel de refrigerante", category: "fluidos", detail: "Entre MIN y MAX en el depósito, NUNCA abrir en caliente" },
  { id: "frenos", label: "Líquido de frenos", category: "fluidos", detail: "Nivel entre MIN y MAX, color claro (no oscuro)" },
  { id: "parabrisas", label: "Líquido de parabrisas", category: "fluidos", detail: "Llenar el depósito con agua y limpiaparabrisas" },
  { id: "direccion", label: "Líquido de dirección hidráulica", category: "fluidos", detail: "Si tu auto tiene dirección hidráulica, verificar nivel" },

  // Neumáticos
  { id: "presion_delante", label: "Presión de neumáticos delanteros", category: "neumaticos" },
  { id: "presion_atras", label: "Presión de neumáticos traseros", category: "neumaticos" },
  { id: "repuesto_presion", label: "Presión de llanta de repuesto", category: "neumaticos", detail: "Revisar cada 3 meses aunque no se use" },
  { id: "desgaste", label: "Desgaste de neumáticos", category: "neumaticos", detail: "Profundidad de cocada ≥ 1.6mm. Sin cortes ni abultamientos" },
  { id: "tuercas", label: "Tuercas y pernos ajustados", category: "neumaticos", detail: "Torque correcto según manual del fabricante" },

  // Luces y eléctrico
  { id: "faros_delante", label: "Faros delanteros (alta y baja)", category: "luces" },
  { id: "faros_atras", label: "Luces traseras y de freno", category: "luces" },
  { id: "intermitentes", label: "Intermitentes y emergencia", category: "luces" },
  { id: "bocina", label: "Bocina / claxon", category: "luces" },
  { id: "bateria", label: "Batería y bornes limpios", category: "luces", detail: "Sin sulfatación en bornes, voltaje ≥ 12.4V en reposo" },

  // Seguridad
  { id: "extintor", label: "Extintor vigente y cargado", category: "seguridad", detail: "Fecha de vencimiento no vencida, manómetro en zona verde" },
  { id: "triangulos", label: "Triángulos de seguridad (2)", category: "seguridad" },
  { id: "botiquin", label: "Botiquín de primeros auxilios", category: "seguridad", detail: "Completo y sin medicamentos vencidos" },
  { id: "cinturones", label: "Cinturones de seguridad", category: "seguridad", detail: "Todos funcionan, se retraen y enganchan bien" },
  { id: "herramientas", label: "Gata, llave de ruedas y herramientas", category: "seguridad", detail: "Gata funcional, llave del tamaño correcto" },

  // Documentos
  { id: "soat", label: "SOAT vigente", category: "documentos", detail: "Verifica la fecha de vencimiento" },
  { id: "revision", label: "Revisión técnica vigente", category: "documentos", detail: "Si aplica a tu vehículo" },
  { id: "licencia", label: "Licencia de conducir vigente", category: "documentos" },
  { id: "matricula", label: "Tarjeta de propiedad / matrícula", category: "documentos" },
];

const categories = [
  { key: "fluidos", label: "Fluidos", icon: Droplets, color: "bg-blue-100 text-blue-700" },
  { key: "neumaticos", label: "Neumáticos", icon: Car, color: "bg-amber-100 text-amber-700" },
  { key: "luces", label: "Luces", icon: Lightbulb, color: "bg-violet-100 text-violet-700" },
  { key: "seguridad", label: "Seguridad", icon: Shield, color: "bg-emerald-100 text-emerald-700" },
  { key: "documentos", label: "Documentos", icon: CheckCircle2, color: "bg-zinc-100 text-zinc-700" },
];

export default function ChecklistClient({ defaults }: { defaults: Defaults }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Cargar estado guardado
  useEffect(() => {
    try {
      const saved = localStorage.getItem("blis_checklist_previaje");
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged: Record<string, boolean> = {};
        for (const item of checklistData) {
          merged[item.id] = parsed[item.id] === true;
        }
        setChecks(merged);
      }
    } catch {
      localStorage.removeItem("blis_checklist_previaje");
    }
    setLoaded(true);
  }, []);

  // Guardar cambios
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("blis_checklist_previaje", JSON.stringify(checks));
  }, [checks, loaded]);

  const toggle = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAll = () => {
    setChecks({});
    localStorage.removeItem("blis_checklist_previaje");
  };

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = checklistData.length;
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const getPressureNote = (id: string) => {
    if (id === "presion_delante" && defaults.presionDelante) return ` (Recomendado: ${defaults.presionDelante} PSI)`;
    if (id === "presion_atras" && defaults.presionAtras) return ` (Recomendado: ${defaults.presionAtras} PSI)`;
    if (id === "repuesto_presion" && defaults.presionRepuesto) return ` (Recomendado: ${defaults.presionRepuesto} PSI)`;
    return "";
  };

  // Agrupar por categoría
  const grouped = categories.map((cat) => {
    const items = checklistData.filter((i) => i.category === cat.key);
    const catChecked = items.filter((i) => checks[i.id]).length;
    return { ...cat, items, catChecked, catTotal: items.length };
  });

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-600 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Checklist Pre-Viaje</h1>
        <p className="text-xs text-zinc-500 mt-1">Formulario de verificación antes de salir a carretera.</p>
      </div>

      {/* Barra de progreso */}
      <div className="card-soft rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-extrabold text-zinc-700">Progreso</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-600">{checkedCount}/{totalCount}</span>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>
        </div>

        <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 90 ? "bg-emerald-500" : progressPct >= 50 ? "bg-amber-500" : "bg-auto-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-400 mt-1.5">
          {progressPct >= 95
            ? "✅ ¡Todo listo para viajar!"
            : progressPct >= 70
            ? "🟡 Casi listo, revisa los pendientes"
            : "🔴 Completa el checklist antes de salir"}
        </p>
      </div>

      {/* Categorías con items */}
      <div className="space-y-2">
        {grouped.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <div key={cat.key} className="card-soft rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${cat.color} flex items-center justify-center`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{cat.label}</p>
                    <p className="text-[10px] text-zinc-400">{cat.catChecked}/{cat.catTotal} verificados</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  cat.catChecked === cat.catTotal
                    ? "bg-emerald-100 text-emerald-700"
                    : cat.catChecked >= cat.catTotal / 2
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}>
                  {cat.catChecked === cat.catTotal ? "✓" : `${cat.catChecked}/${cat.catTotal}`}
                </span>
              </div>

              <div className="px-4 pb-3 space-y-0.5">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-start gap-3 py-2.5 px-3 rounded-xl text-left transition-colors ${
                      checks[item.id]
                        ? "bg-emerald-50"
                        : "bg-zinc-50 hover:bg-zinc-100"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      checks[item.id]
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-zinc-300"
                    }`}>
                      {checks[item.id] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${checks[item.id] ? "text-emerald-800 line-through" : "text-zinc-700"}`}>
                        {item.label}{getPressureNote(item.id)}
                      </p>
                      {item.detail && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">{item.detail}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen final */}
      {progressPct >= 95 && (
        <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-lg font-black text-emerald-700">¡Listo para el viaje!</p>
          <p className="text-xs text-emerald-600 mt-1">Todos los puntos del checklist están verificados. Buen viaje.</p>
        </div>
      )}

      {progressPct > 0 && progressPct < 95 && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-lg font-black text-amber-700">Aún hay pendientes</p>
          <p className="text-xs text-amber-600 mt-1">{totalCount - checkedCount} puntos sin verificar. No salgas sin revisarlos.</p>
        </div>
      )}
    </div>
  );
}
