export default function AutoWebPage() {
  return (
    <main className="min-h-screen bg-auto-gradient">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-auto-600 flex items-center justify-center shadow-lg shadow-auto-600/30 mb-6">
          <span className="text-2xl">🚗</span>
        </div>
        <h1 className="text-4xl font-extrabold text-auto-700 tracking-tight">
          Blis Auto
        </h1>
        <p className="text-zinc-600 mt-4 text-lg leading-relaxed max-w-md mx-auto">
          La PWA que todo conductor necesita. Bitácora inteligente, calculadoras automotrices y marketplace en un solo lugar.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <a href="/auto/app" className="px-6 py-3 rounded-2xl bg-auto-600 text-white font-bold hover:bg-auto-700 transition-colors shadow-lg shadow-auto-600/20">
            Entrar
          </a>
          <a href="/auto/webg" className="px-6 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:shadow-md transition-all">
            Probar gratis
          </a>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: "⛽", title: "Control de combustible", desc: "Registra cargas, calcula rendimiento y gasta mejor." },
            { icon: "🔧", title: "Mantenimientos", desc: "Historial completo de servicios preventivos y correctivos." },
            { icon: "🧮", title: "7 Calculadoras", desc: "Costo de viaje, depreciación, llantas, presión y más." },
            { icon: "📄", title: "Documentos al día", desc: "SOAT, revisión técnica, póliza. Con alertas de vencimiento." },
            { icon: "🛒", title: "Marketplace", desc: "Compra y vende repuestos, accesorios y servicios." },
            { icon: "📊", title: "Finanzas claras", desc: "Gráficos de gasto mensual y anual por categorías." },
          ].map((f) => (
            <div key={f.title} className="card-soft rounded-2xl p-4 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-xs font-bold text-zinc-800 mt-2">{f.title}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
