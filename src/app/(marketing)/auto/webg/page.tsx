export default function AutoWebGPage() {
  return (
    <main className="min-h-screen bg-auto-gradient">
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-auto-100 flex items-center justify-center mb-6">
          <span className="text-4xl">🎁</span>
        </div>
        <h1 className="text-4xl font-extrabold text-auto-700 tracking-tight">
          Prueba Blis Auto gratis
        </h1>
        <p className="text-zinc-600 mt-4 text-lg leading-relaxed max-w-md mx-auto">
          60 días de acceso completo a todas las herramientas. Sin tarjeta, sin compromiso.
        </p>
        <div className="mt-8 space-y-3 max-w-xs mx-auto">
          {[
            "Bitácora inteligente de mantenimientos",
            "7 calculadoras automotrices",
            "Control de gastos y gráficos",
            "Documentos con alertas de vencimiento",
            "Marketplace de repuestos",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="text-emerald-500 font-bold">✓</span> {item}
            </div>
          ))}
        </div>
        <a href="/auto/app" className="inline-block mt-8 px-8 py-3.5 rounded-2xl bg-auto-600 text-white font-bold hover:bg-auto-700 transition-colors shadow-lg shadow-auto-600/20">
          Comenzar gratis
        </a>
        <p className="text-xs text-zinc-400 mt-4">Sin tarjeta de crédito. 60 días de prueba.</p>
      </section>
    </main>
  );
}
