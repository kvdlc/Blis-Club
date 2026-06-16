export default function AutoLandingPage() {
  return (
    <main className="min-h-screen bg-auto-gradient flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-auto-600 flex items-center justify-center shadow-lg shadow-auto-600/30 mb-6">
        <span className="text-white text-2xl">🚗</span>
      </div>
      <h1 className="text-4xl font-extrabold text-auto-700 tracking-tight">
        Blis Auto
      </h1>
      <p className="text-zinc-500 mt-3 max-w-xs">
        El ecosistema inteligente para tu vehículo. Bitácora, calculadoras y marketplace en un solo lugar.
      </p>
      <div className="flex gap-3 mt-8">
        <a
          href="/auto/app"
          className="px-6 py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-700 transition-colors shadow-lg shadow-auto-600/20"
        >
          Entrar
        </a>
        <a
          href="/auto/web"
          className="px-6 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold text-sm hover:shadow-md transition-all"
        >
          Conocer más
        </a>
      </div>
    </main>
  );
}
