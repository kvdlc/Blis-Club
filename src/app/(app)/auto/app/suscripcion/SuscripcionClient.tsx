"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Zap, Shield, Star, Fuel, Wrench, Calculator, FileText, ShoppingCart, BarChart3, Camera, ClipboardList } from "lucide-react";

interface Props {
  subscription: any;
  planes: any[];
}

export default function SuscripcionClient({ subscription, planes }: Props) {
  const [isAnnual, setIsAnnual] = useState(false);

  const planActual = subscription?.plans?.name || subscription?.plan_type || "Temporal";
  const estado = subscription?.status === "active" ? "Activo" : "Inactivo";
  const expira = subscription?.current_period_end || subscription?.expires_at;
  const diasRestantes = expira
    ? Math.max(0, Math.ceil((new Date(expira).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatPrice = (cents: number) => {
    return `S/ ${(cents / 100).toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700">
        <ArrowLeft className="w-4 h-4" /> Perfil
      </Link>

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-auto-600 flex items-center justify-center shadow-lg shadow-auto-600/20">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-800">Blis Auto Pro</h1>
        <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
          Todas las herramientas que necesitas para cuidar tu vehículo en un solo lugar.
        </p>
      </div>

      {/* Plan actual */}
      {subscription && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4">
          <h3 className="text-xs font-extrabold text-zinc-700 mb-3">Tu plan actual</h3>
          <div className="bg-auto-600/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-auto-600/100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 capitalize">{planActual}</p>
                <p className={`text-xs font-bold ${subscription.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                  {estado} · {diasRestantes} días restantes
                </p>
              </div>
            </div>
            {expira && (
              <p className="text-[10px] text-zinc-500 text-center mt-2">
                Vence: {new Date(expira).toLocaleDateString("es-PE")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toggle */}
      {planes.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${!isAnnual ? "text-zinc-800" : "text-zinc-500"}`}>Mensual</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-auto-600/100" : "bg-white/15"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-zinc-100 shadow transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-xs font-bold ${isAnnual ? "text-zinc-800" : "text-zinc-500"}`}>Anual</span>
          {isAnnual && <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">Ahorra 20%</span>}
        </div>
      )}

      {/* Planes */}
      <div className="space-y-3">
        {planes.map((plan) => (
          <div key={plan.id} className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-extrabold text-zinc-800">{plan.name}</p>
                <p className="text-xs text-zinc-500">{plan.description || "Acceso completo a todas las herramientas"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-auto-500">
                  {plan.price_cents === 0 ? "Gratis" : formatPrice(plan.price_cents)}
                </p>
                <p className="text-[10px] text-zinc-500">/ {plan.billing_interval === "quarter" ? "trimestre" : plan.billing_interval === "year" ? "año" : "mes"}</p>
              </div>
            </div>

            {plan.features && (
              <div className="space-y-1 mb-3">
                {plan.features.split(",").map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    {f.trim()}
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/auto/app/checkout?plan=${plan.id}`}
              className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold transition-colors ${
                plan.id === subscription?.plan_id
                  ? "bg-zinc-100 text-zinc-500 cursor-default"
                  : plan.price_cents === 0
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-auto-600 text-white hover:bg-auto-500"
              }`}
            >
              {plan.id === subscription?.plan_id ? "Plan actual" : plan.price_cents === 0 ? "Comenzar gratis" : "Contratar"}
            </Link>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-700 mb-3">Todo lo que incluye</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "⛽", text: "Control de combustible" },
            { icon: "🔧", text: "Historial de mantenimientos" },
            { icon: "🧮", text: "7 calculadoras automotrices" },
            { icon: "📄", text: "Documentos con alertas" },
            { icon: "🛒", text: "Marketplace de repuestos" },
            { icon: "📊", text: "Gráficos financieros" },
            { icon: "📸", text: "Fotos y perfil del vehículo" },
            { icon: "📋", text: "Reporte Carfax exportable" },
          ].map((f) => {
            const featureIconMap: Record<string, React.ReactNode> = {
              "⛽": <Fuel className="w-3.5 h-3.5" />,
              "🔧": <Wrench className="w-3.5 h-3.5" />,
              "🧮": <Calculator className="w-3.5 h-3.5" />,
              "📄": <FileText className="w-3.5 h-3.5" />,
              "🛒": <ShoppingCart className="w-3.5 h-3.5" />,
              "📊": <BarChart3 className="w-3.5 h-3.5" />,
              "📸": <Camera className="w-3.5 h-3.5" />,
              "📋": <ClipboardList className="w-3.5 h-3.5" />,
            };
            return (
              <div key={f.text} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span>{featureIconMap[f.icon]}</span> {f.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
