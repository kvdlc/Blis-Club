"use client";

import Link from "next/link";
import { ArrowLeft, Check, Crown } from "lucide-react";

interface Props {
  subscription: any;
  planes: any[];
}

export default function SuscripcionClient({ subscription, planes }: Props) {
  const planActual = subscription?.plans?.name || subscription?.plan_type || "Temporal";
  const estado = subscription?.status === "active" ? "Activo" : "Inactivo";
  const expira = subscription?.current_period_end || subscription?.expires_at;
  const diasRestantes = expira
    ? Math.max(0, Math.ceil((new Date(expira).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-4">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-600 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Perfil
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Suscripción</h1>
        <p className="text-xs text-zinc-500 mt-1">Gestiona tu plan de Auto</p>
      </div>

      {/* Plan actual */}
      <div className="card-soft rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-700 mb-3">Tu plan actual</h3>

        {subscription ? (
          <div className="space-y-3">
            <div className="bg-auto-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-auto-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800 capitalize">{planActual}</p>
                  <p className="text-xs text-zinc-500">{estado}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-400">Estado</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  subscription.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>{estado}</span>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-400">Días restantes</p>
                <p className="text-sm font-bold text-zinc-800">{diasRestantes}</p>
              </div>
            </div>

            {expira && (
              <p className="text-[10px] text-zinc-400 text-center">
                {subscription.plan_type === "temporal" ? "Expira" : "Próximo pago"}: {new Date(expira).toLocaleDateString("es-PE")}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-zinc-400">No tienes una suscripción activa.</p>
          </div>
        )}
      </div>

      {/* Planes disponibles */}
      <div className="card-soft rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-700 mb-3">Planes disponibles</h3>

        {planes.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-3">No hay planes disponibles.</p>
        ) : (
          <div className="space-y-2">
            {planes.map((plan) => (
              <div key={plan.id}
                className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-800">{plan.name}</p>
                  <p className="text-xs text-zinc-500">
                    {plan.price_monthly ? `S/ ${plan.price_monthly}/mes` : "Gratis"}
                    {plan.billing_interval === "quarter" && " (trimestral)"}
                  </p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold hover:bg-auto-700 transition-colors">
                  {plan.price_monthly ? "Contratar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
