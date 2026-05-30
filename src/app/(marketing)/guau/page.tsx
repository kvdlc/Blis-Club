import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-4">
        Blis Club
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mb-8">
        Tu ecosistema de apps para mascotas. Nutrición, entrenamiento y seguimiento en un solo lugar.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold transition-colors"
        >
          Comenzar ahora
        </Link>
        <Link
          href="/guau/app"
          className="rounded-xl border border-primary-600 text-primary-600 dark:text-primary-400 px-8 py-3 font-semibold transition-colors hover:bg-primary-50 dark:hover:bg-primary-950"
        >
          Ya tengo cuenta
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        {[
          { title: "Nutrición BARF", desc: "Calculadora inteligente y 150 recetas naturales" },
          { title: "Academia Canina", desc: "Entrenamiento paso a paso estilo Duolingo" },
          { title: "Tracker de Paseos", desc: "Registra, mide y mejora cada salida" },
        ].map((f) => (
          <div key={f.title} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6">
            <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-1">{f.title}</h3>
            <p className="text-sm text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
