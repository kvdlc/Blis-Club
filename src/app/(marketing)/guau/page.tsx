import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-200/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-[1.5rem] bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-600/30">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        <h1 className="text-5xl font-extrabold text-primary-700 mb-3 tracking-tight">
          Blis Club
        </h1>
        <p className="text-lg text-zinc-500 max-w-md mb-10 leading-relaxed">
          Tu ecosistema de apps para mascotas. Nutrición, entrenamiento y seguimiento en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="rounded-[1.25rem] bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 font-bold transition-all active:scale-[0.97] shadow-lg shadow-primary-600/25"
          >
            Comenzar ahora
          </Link>
          <Link
            href="/guau/app"
            className="rounded-[1.25rem] border border-primary-200 text-primary-700 px-8 py-3.5 font-bold transition-all hover:bg-primary-50"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {[
            { title: "Nutrición BARF", desc: "Calculadora inteligente y 150 recetas naturales", color: "bg-secondary-50 border-secondary-100" },
            { title: "Academia Canina", desc: "Entrenamiento paso a paso estilo Duolingo", color: "bg-warning-50 border-warning-100" },
            { title: "Tracker de Paseos", desc: "Registra, mide y mejora cada salida", color: "bg-accent-50 border-accent-100" },
          ].map((f) => (
            <div key={f.title} className={`${f.color} rounded-[1.5rem] p-6 border shadow-sm`}>
              <h3 className="font-bold text-zinc-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
