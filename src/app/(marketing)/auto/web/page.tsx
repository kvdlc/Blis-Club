export default function AutoWebPage() {
  return (
    <main className="min-h-screen bg-auto-gradient">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-auto-600 flex items-center justify-center shadow-auto-glow mb-6">
          <span className="text-2xl">🚗</span>
        </div>
        <h1 className="text-4xl font-extrabold text-auto-500 tracking-tight">
          Blis Auto
        </h1>
        <p className="text-zinc-400 mt-4 text-lg leading-relaxed max-w-md mx-auto">
          La PWA que todo conductor necesita. Bitácora inteligente, calculadoras automotrices y marketplace en un solo lugar.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <a href="/auto/app" className="px-6 py-3 rounded-2xl bg-auto-600 text-white font-bold hover:bg-auto-500 transition-colors shadow-auto-glow">
            Entrar
          </a>
          <a href="/auto/webg" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 font-bold hover:bg-white/10 hover:border-white/20 transition-all">
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
            <div key={f.title} className="card-auto-dark rounded-2xl p-4 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-xs font-bold text-zinc-100 mt-2">{f.title}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
