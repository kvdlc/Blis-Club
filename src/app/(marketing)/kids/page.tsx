import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { categoryMeta, type KidsCategory } from "@/lib/kids";
import InlineRegister from "@/components/InlineRegister";
import { KidsMagicBackground } from "@/components/kids/KidsMagicBackground";
import { Countdown } from "./Countdown";
import {
  Palette, Puzzle, BookOpen, Printer, Sparkles, Star, ShieldCheck, Heart, ArrowRight,
  Check, X, Clock, Wallet, Frown, BatteryLow, Smartphone, Users, Download, Wand2, Gift, Crown, BadgeCheck, CreditCard,
  Hand, Brain, Languages, Target, Home as HomeIcon, Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kids Club · La biblioteca infinita para tus hijos",
  description:
    "Colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos. Material nuevo cada semana. Deja de comprar cuadernos: imprímelos ilimitados.",
};

const LEARNING = [
  { icon: Hand, title: "Motricidad fina", text: "Al colorear y trazar, los niños fortalecen la mano y la coordinación para escribir." },
  { icon: Brain, title: "Lógica y memoria", text: "Crucigramas, sudoku y laberintos entrenan el razonamiento y la atención." },
  { icon: Languages, title: "Vocabulario", text: "Con las sopas de letras y los puzzles aprenden palabras nuevas sin darse cuenta." },
  { icon: BookOpen, title: "Amor por la lectura", text: "Los cuentos ilustrados y con voz despiertan el gusto por leer desde pequeños." },
  { icon: Palette, title: "Creatividad", text: "Elegir colores y crear libremente desarrolla la imaginación y la confianza." },
  { icon: Target, title: "Concentración", text: "Resolver un reto completo les enseña a enfocarse y a terminar lo que empiezan." },
];

const AGES = [
  { range: "3 a 5 años", title: "Primeros trazos y colores", text: "Láminas grandes para colorear, unir puntos sencillos y cuentos con voz para los que aún no leen solos.", icon: Palette, tone: "from-rose-100 to-orange-100" },
  { range: "6 a 8 años", title: "Palabras y lógica", text: "Crucigramas, sopa de letras, laberintos y lecturas cortas que amplían vocabulario y pensamiento.", icon: Puzzle, tone: "from-emerald-100 to-sky-100" },
  { range: "9 a 10 años", title: "Retos de verdad", text: "Puzzles más difíciles, sudoku, sopas grandes y cuentos largos para seguir creciendo con desafíos.", icon: BookOpen, tone: "from-violet-100 to-fuchsia-100" },
];


const PAINS = [
  { icon: Wallet, title: "Compras cuadernos que duran un día", text: "Gastas en libros para colorear que el niño termina en una tarde y a la semana toca comprar otro." },
  { icon: Frown, title: "Los niños se aburren rapidísimo", text: "Siempre los mismos dibujos y actividades. Al tercer día ya no quieren saber nada." },
  { icon: BatteryLow, title: "Pantallas sin nada educativo", text: "El tablet acaba en videos sin sentido porque no tienes actividades buenas a mano." },
  { icon: Clock, title: "No tienes tiempo de buscar", text: "Buscas en internet, imprimes mal, recortas... y al final no encuentras lo que querías." },
];

const FEATURES = [
  { icon: Palette, title: "Colorear sin límites", text: "Decenas de láminas nuevas cada semana, listas para pintar en pantalla o imprimir." },
  { icon: Puzzle, title: "Puzzles y retos", text: "Crucigramas, laberintos, sopa de letras y unir puntos, de muy fáciles a muy difíciles." },
  { icon: BookOpen, title: "Cuentos con voz", text: "Historias ilustradas que se leen en voz alta para los que aún no leen solos." },
  { icon: Printer, title: "Imprimibles en PDF", text: "Descarga e imprime con un clic, tantas veces como quieras. Nunca se acaba." },
  { icon: Wand2, title: "Contenido nuevo siempre", text: "Agregamos material cada semana: nunca se quedan sin algo que hacer." },
  { icon: ShieldCheck, title: "Sin anuncios, sin sustos", text: "Un espacio seguro y tranquilo, pensado 100% para niños." },
  { icon: Download, title: "Hasta 50 páginas por libro", text: "Libros completos listos para descargar e imprimir en casa o en la imprenta." },
  { icon: Users, title: "Varios hijos, un solo plan", text: "Crea un perfil para cada pequeño con su nombre y avatar." },
];

const STEPS = [
  { n: 1, title: "Crea tu cuenta", text: "En menos de un minuto, sin complicaciones." },
  { n: 2, title: "Elige una actividad", text: "Colorear, puzzles, cuentos o imprimibles. Filtra por edad." },
  { n: 3, title: "Juega o imprime", text: "Directo en la pantalla o descarga el PDF para pintar a mano." },
];

const COMPARE = [
  { label: "Dura toda la infancia", ours: true, theirs: false },
  { label: "Material nuevo cada semana", ours: true, theirs: false },
  { label: "Ilimitado (imprime cuando quieras)", ours: true, theirs: false },
  { label: "Cuentos con lectura en voz alta", ours: true, theirs: false },
  { label: "Puzzles de fácil a difícil", ours: true, theirs: false },
  { label: "Sin anuncios", ours: true, theirs: true },
  { label: "Tienes que ir a la tienda", ours: false, theirs: true },
];

const TESTIMONIALS = [
  { name: "María G.", text: "Mi hija ya no me pide cuadernos. Cada semana entra y encuentra algo nuevo. Nos ahorró un montón." },
  { name: "Carlos R.", text: "Imprimo las láminas y los puzzles para los dos niños. Ya no gasto en libros cada mes." },
  { name: "Lucía M.", text: "Los cuentos con voz son lo mejor para mi hijo de 4. Se queda escuchando feliz." },
  { name: "Andrea P.", text: "Los laberintos y las sopas de letras los tienen entretenidos en los viajes." },
];

const FAQS = [
  { q: "¿Cómo termino con el gasto en cuadernos?", a: "Adentro tienes actividades ilimitadas y libros en PDF. Descargas e imprimes las veces que quieras durante toda la infancia de tus hijos. Dejas de comprar cada semana." },
  { q: "¿Sirve para varias edades?", a: "Sí. El contenido está separado por edades, desde 3 hasta 10 años, y por dificultad: muy fácil, medio y difícil." },
  { q: "¿Necesito imprimir para usarlo?", a: "No. Puedes colorear y jugar directamente en la pantalla, y también descargar los PDF para imprimir cuando quieras." },
  { q: "¿En qué dispositivos funciona?", a: "En cualquier tablet, computadora o celular con internet. No necesitas instalar nada." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí, desde tu perfil, sin preguntas. Y tienes garantía de 7 días: si no te gusta, te devolvemos el dinero." },
  { q: "¿Hay anuncios o contenido no apto?", a: "Nunca. Es un espacio seguro, sin anuncios y pensado solo para niños." },
];

export default async function KidsSitePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: app }, { count: actCount }, { count: printCount }, { count: bookCount }, { data: impBooks }] = await Promise.all([
    supabase.from("kids_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("applications").select("id").eq("slug", "kids").maybeSingle(),
    supabase.from("kids_activities").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("kids_printables").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("kids_activities").select("*", { count: "exact", head: true }).eq("is_published", true).eq("data->>section", "imprimible"),
    supabase.from("kids_activities").select("id,title,cover_url,data").eq("is_published", true).eq("data->>section", "imprimible").limit(6),
  ]);
  const downloadables = (printCount ?? 0) + (bookCount ?? 0);
  const bookCovers = (impBooks ?? []).map((b: any) => {
    const pages = Array.isArray(b.data?.pages) ? b.data.pages : [];
    return pages.find((p: any) => p?.image_url)?.image_url ?? b.cover_url;
  }).filter(Boolean).slice(0, 6);

  let plans: any[] = [];
  if (app?.id) {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("application_id", app.id)
      .or("landing_visible.eq.true,landing_visible.is.null")
      .order("price_cents", { ascending: true });
    plans = data ?? [];
  }
  const plan = plans[0];
  const price = plan ? `$${(plan.price_cents / 100).toFixed(2)}` : "$19.90";
  const original = plan?.original_price_cents ? `$${(plan.original_price_cents / 100).toFixed(2)}` : "$49.90";
  const interval = plan?.billing_interval === "quarter" ? "trimestre" : plan?.billing_interval === "year" ? "año" : "mes";

  const cats = (categories ?? []) as KidsCategory[];
  const catCount = cats.length || 6;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <KidsMagicBackground />

      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/kids" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl text-white shadow-md">
              <Palette className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Blis Club</p>
              <p className="text-base font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>Kids Club</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-zinc-600 md:flex">
            <a href="#beneficios" className="hover:text-violet-600">Beneficios</a>
            <a href="#como" className="hover:text-violet-600">Cómo funciona</a>
            <a href="#contenido" className="hover:text-violet-600">Contenido</a>
            <a href="#precio" className="hover:text-violet-600">Precio</a>
            <a href="#faq" className="hover:text-violet-600">Preguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/kids/app" className="hidden text-sm font-black text-violet-600 sm:block">Entrar</Link>
            <a href="#precio" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-black text-white shadow-md">Empezar</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-10 pt-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-violet-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Material nuevo cada semana · {actCount ?? 0}+ actividades
        </div>
        <h1 className="mt-6 text-4xl font-black leading-[1.05] text-zinc-900 sm:text-6xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          La biblioteca que
          <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
            nunca se acaba
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg">
          Colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos con voz.
          Deja de comprar cuadernos que se acaban en una tarde: aquí tienes <strong>actividades ilimitadas</strong> para toda la infancia de tus hijos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#precio" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-4 text-base font-black text-white shadow-lg transition-transform hover:scale-105">
            Empezar ahora <ArrowRight className="h-5 w-5" />
          </a>
          <Link href="/kids/webg" className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-violet-700 shadow-md transition-transform hover:scale-105">
            Prueba gratis
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 en satisfacción</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Sin anuncios</span>
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> {catCount} tipos de actividades</span>
        </div>

        {cats.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {cats.map((c) => (
              <div key={c.id} className="kids-card overflow-hidden">
                <div className="aspect-square bg-white">
                  {c.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black" style={{ color: categoryMeta(c.slug).color }}>{c.name.charAt(0)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* POPULAR SOCIAL PROOF */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-8">
        <div className="kids-card grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          {[
            { v: `${actCount ?? 0}+`, l: "Actividades" },
            { v: `${downloadables}+`, l: "Imprimibles PDF" },
            { v: "∞", l: "Material nuevo" },
            { v: "4.9★", l: "Padres felices" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-black text-magic" style={{ fontFamily: "var(--font-quicksand)" }}>{s.v}</p>
              <p className="text-xs font-bold text-zinc-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          ¿Te suena familiar?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-500">
          Sabemos lo que es tener niños en casa. Esto lo viven todos los padres.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PAINS.map((p) => (
            <div key={p.title} className="kids-card flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                <p.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-800">{p.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-12">
        <div className="kids-card overflow-hidden">
          <div className="grid items-center gap-6 p-6 sm:grid-cols-2 sm:p-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" /> La solución
              </span>
              <h2 className="mt-4 text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
                Una sola suscripción. Toda la infancia.
              </h2>
              <p className="mt-3 text-zinc-600">
                En lugar de comprar cuadernos cada semana, Kids Club te da una <strong>biblioteca viva</strong>:
                cientos de láminas, puzzles y cuentos que crecen y se renuevan cada semana.
              </p>
              <ul className="mt-5 space-y-2">
                {["Actividades nuevas cada semana", "Descarga e imprime sin límites", "Sin volver a comprar cuadernos", "Para todas las edades (3 a 10 años)"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Check className="h-4 w-4 text-emerald-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[Palette, Puzzle, BookOpen, Printer].map((I, i) => (
                <div key={i} className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                  <I className="h-10 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT / CATEGORIES */}
      <section id="contenido" className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Todo lo que van a encontrar
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => {
            const meta = categoryMeta(c.slug);
            return (
              <div key={c.id} className="kids-card flex flex-col items-center gap-2 p-4 text-center">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white">
                  {c.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black" style={{ color: meta.color }}>{c.name.charAt(0)}</div>
                  )}
                </div>
                <p className="text-sm font-black text-zinc-800">{c.name}</p>
                <p className="text-[11px] text-zinc-500">{c.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section id="beneficios" className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Todo lo que incluye
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="kids-card p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-black text-zinc-800">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Míralo en acción
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-500">
          Una app colorida y sencilla, pensada para que los niños naveguen solos y con seguridad.
        </p>
        <div className="mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">
          {[
            { label: "Inicio · elige y juega", imgs: cats.slice(0, 6).map((c) => c.cover_url).filter(Boolean) as string[] },
            { label: "Juegos · puzzles a su nivel", imgs: cats.filter((c) => ["crucigrama", "laberinto", "sopa_letras", "unir_puntos", "sudoku", "contar"].includes(c.slug)).map((c) => c.cover_url).filter(Boolean).slice(0, 6) as string[] },
            { label: "Imprimibles · descarga en PDF", imgs: bookCovers as string[] },
          ].map((p) => (
            <div key={p.label} className="w-[220px]">
              <div className="relative rounded-[2.2rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl">
                <div className="overflow-hidden rounded-[1.5rem] bg-kids-gradient">
                  <div className="flex items-center justify-between px-3 pb-2 pt-3">
                    <span className="text-[10px] font-black text-violet-700">Kids Club</span>
                    <span className="h-4 w-4 rounded-full bg-white/70" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 px-2.5 pb-3">
                    {p.imgs.slice(0, 6).map((src, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-around border-t border-white/50 bg-white/70 px-2 py-1.5 text-violet-500">
                    <HomeIcon className="h-4 w-4" /><Compass className="h-4 w-4" /><Puzzle className="h-4 w-4" /><Download className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs font-black text-zinc-600">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AGES */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Para cada edad
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-500">
          Desde los primeros trazos hasta los retos más difíciles. Contenido que crece con tus hijos.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {AGES.map((a) => (
            <div key={a.range} className={`kids-card bg-gradient-to-br ${a.tone} p-6`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-violet-600">
                <a.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-violet-600">{a.range}</p>
              <h3 className="mt-1 text-lg font-black text-zinc-800">{a.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEARNING */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Aprender jugando (de verdad)
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-500">
          No es solo entretenimiento: cada actividad desarrolla habilidades que les sirven en el colegio y en la vida.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING.map((l) => (
            <div key={l.title} className="kids-card flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <l.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-800">{l.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{l.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como" className="relative z-10 mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Así de fácil
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="kids-card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-black text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-black text-zinc-800">{s.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEVICES */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-8">
        <div className="kids-card flex flex-wrap items-center justify-center gap-6 p-6 text-center">
          <Smartphone className="h-8 w-8 text-violet-500" />
          <p className="text-sm font-bold text-zinc-700">
            Funciona en <span className="text-violet-600">tablet</span>, <span className="text-violet-600">computadora</span> y <span className="text-violet-600">celular</span>. Nada que instalar.
          </p>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Cuadernos de tienda vs. Kids Club
        </h2>
        <div className="kids-card mt-8 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-zinc-100 bg-zinc-50 p-3 text-center text-xs font-black uppercase tracking-wide text-zinc-500">
            <span className="text-left">Comparación</span>
            <span className="text-violet-600">Kids Club</span>
            <span>Cuadernos</span>
          </div>
          {COMPARE.map((row) => (
            <div key={row.label} className="grid grid-cols-3 items-center border-b border-zinc-50 p-3 text-sm last:border-0">
              <span className="font-semibold text-zinc-700">{row.label}</span>
              <span className="flex justify-center">{row.ours ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-zinc-300" />}</span>
              <span className="flex justify-center">{row.theirs ? <Check className="h-5 w-5 text-zinc-400" /> : <X className="h-5 w-5 text-rose-300" />}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Familias que ya juegan con Kids Club
        </h2>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="kids-card w-[260px] shrink-0 p-5 sm:w-auto">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="mt-3 text-sm text-zinc-700">“{t.text}”</p>
              <p className="mt-3 text-xs font-black text-zinc-500">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precio" className="relative z-10 mx-auto max-w-md px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Un precio. Todo incluido.
        </h2>
        <div className="kids-card mt-8 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-center">
            <p className="text-sm font-black text-white">{plan?.badge || "Oferta de lanzamiento"}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm font-black text-zinc-700">{plan?.name || "Kids Club Pro"}</p>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-zinc-900">{price}</span>
              <span className="text-zinc-400">/{interval}</span>
            </div>
            <p className="mt-1 text-xs font-bold text-zinc-400">
              <span className="line-through">{original}</span> · Menos de lo que cuesta UN solo cuaderno al mes
            </p>
            <ul className="mt-5 space-y-2 text-left">
              {(plan?.features?.length ? plan.features : [
                "Todas las actividades ilimitadas",
                "Imprimibles y libros en PDF",
                "Cuentos con lectura en voz alta",
                "Contenido nuevo cada semana",
                "Sin anuncios",
              ]).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-zinc-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            {plan?.id && (
              <Link
                href={`/kids/web/checkout?plan=${plan.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-4 text-base font-black text-white shadow-lg"
              >
                <Crown className="h-5 w-5" /> {plan?.cta_text || "Suscribirme ahora"}
              </Link>
            )}
            <p className="mt-3 text-[11px] font-semibold text-zinc-400">Garantía de 7 días · Cancela cuando quieras</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-center text-sm font-black text-zinc-600">…o empieza gratis ahora mismo</p>
          <InlineRegister appSlug="kids" redirectTo="/kids/app" buttonText="Crear cuenta gratis" placeholder="tu@correo.com" />
        </div>
      </section>

      {/* URGENCY */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-600 p-8 text-center shadow-xl sm:p-12">
          <Gift className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 text-white/15" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black text-white">
            <Clock className="h-3.5 w-3.5" /> Oferta por tiempo limitado
          </span>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            El precio de lanzamiento sube pronto
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/90 sm:text-base">
            Asegúrate hoy al precio más bajo que tendrá. Cuando termine el contador, el precio vuelve a {original}.
          </p>
          <div className="mt-7">
            <Countdown />
          </div>
          <a href="#precio" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black text-violet-700 shadow-lg transition-transform hover:scale-105">
            Quiero mi acceso <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <div className="kids-card flex flex-wrap items-center justify-center gap-6 p-6 text-center">
          {[
            { icon: ShieldCheck, t: "Garantía de 7 días" },
            { icon: CreditCard, t: "Pago 100% seguro" },
            { icon: Check, t: "Cancela cuando quieras" },
          ].map((g) => (
            <span key={g.t} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600">
              <g.icon className="h-5 w-5 text-emerald-500" /> {g.t}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Preguntas frecuentes
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="kids-card group p-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-black text-zinc-800 marker:content-none">
                {f.q}
                <span className="text-lg font-black text-violet-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-600 p-8 text-center shadow-xl sm:p-12">
          <Wand2 className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-white/15" />
          <h2 className="text-2xl font-black text-white sm:text-4xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            Dale a tus hijos una biblioteca infinita
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/90 sm:text-base">
            Colorear, puzzles y cuentos con voz. Deja de comprar cuadernos y empieza a disfrutar hoy.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#precio" className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-violet-700 shadow-lg transition-transform hover:scale-105">
              Empezar ahora <ArrowRight className="h-5 w-5" />
            </a>
            <Link href="/kids/webg" className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/70 px-7 py-4 text-base font-black text-white transition-transform hover:scale-105">
              Prueba gratis
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/40 bg-white/50 py-10 text-center text-xs text-zinc-500">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-5">
          <span className="font-black text-zinc-700">Blis Club · Kids Club</span>
          <Link href="/legal/terminos" className="hover:text-violet-600">Términos</Link>
          <Link href="/legal/privacidad" className="hover:text-violet-600">Privacidad</Link>
          <Link href="/legal/reembolsos" className="hover:text-violet-600">Reembolsos</Link>
          <Link href="/kids/app" className="hover:text-violet-600">Entrar a la app</Link>
        </div>
        <p className="mt-4 text-zinc-400">Hecho con cariño para las familias.</p>
      </footer>
    </div>
  );
}
