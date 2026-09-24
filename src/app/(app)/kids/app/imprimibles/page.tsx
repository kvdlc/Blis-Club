import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryMeta } from "@/lib/kids";
import { activitySection } from "@/lib/kids/sections";
import { BookOpen, Star, Sparkles, Download } from "lucide-react";
import { DownloadPdfButton, OpenPdfLink } from "@/components/kids/DownloadPdfButton";

export const dynamic = "force-dynamic";

interface StoreItem {
  id: string;
  kind: "book" | "printable";
  title: string;
  category_slug: string;
  cover_url: string | null;
  pages: number;
  age_min: number;
  age_max: number;
  downloadHref: string;
  viewHref: string;
}

export default async function DescargarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [booksRes, printablesRes, catsRes] = await Promise.all([
    supabase.from("kids_activities").select("id,title,category_slug,cover_url,age_min,age_max,data").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("kids_printables").select("id,title,category_slug,cover_url,age_min,age_max,pages").eq("is_published", true).order("sort_order", { ascending: true }),
    supabase.from("kids_categories").select("slug,name,color").order("sort_order", { ascending: true }),
  ]);
  const catMap = new Map((catsRes.data ?? []).map((c: any) => [c.slug, c]));

  const items: StoreItem[] = [];
  for (const a of booksRes.data ?? []) {
    const pages = Array.isArray(a.data?.pages) ? a.data.pages.length : 0;
    if (pages < 2) continue;
    if (activitySection(a) !== "imprimible") continue;
    items.push({
      id: a.id, kind: "book", title: a.title, category_slug: a.category_slug,
      cover_url: (Array.isArray(a.data?.pages) ? a.data.pages.find((p: any) => p?.image_url)?.image_url : null) ?? a.cover_url,
      pages, age_min: a.age_min, age_max: a.age_max,
      downloadHref: `/api/kids/book-pdf/${a.id}`, viewHref: `/kids/app/imprimibles/libro/${a.id}`,
    });
  }
  for (const p of printablesRes.data ?? []) {
    items.push({
      id: p.id, kind: "printable", title: p.title, category_slug: p.category_slug, cover_url: p.cover_url,
      pages: p.pages ?? 1, age_min: p.age_min, age_max: p.age_max,
      downloadHref: `/api/kids/printable-pdf/${p.id}`, viewHref: `/kids/app/imprimibles/${p.id}`,
    });
  }

  const byCat = new Map<string, StoreItem[]>();
  for (const it of items) {
    const arr = byCat.get(it.category_slug) ?? [];
    arr.push(it);
    byCat.set(it.category_slug, arr);
  }
  const order = ["colorear", "cuento", "sopa_letras", "crucigrama", "laberinto", "unir_puntos"];
  const cats = [...byCat.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div className="space-y-6">
      <section className="kids-card relative flex items-center gap-4 overflow-hidden p-5">
        <Star className="pointer-events-none absolute -right-2 -top-3 h-16 w-16 text-amber-200 animate-float-slow" />
        <Sparkles className="pointer-events-none absolute bottom-2 right-16 h-7 w-7 text-violet-200 animate-sparkle" />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-md">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-magic" style={{ fontFamily: "var(--font-quicksand)" }}>
            Ebooks en PDF
          </h1>
          <p className="text-xs font-semibold text-zinc-500">
            Descarga el PDF con portada y todo, listo para imprimir o guardar.
          </p>
        </div>
      </section>

      {items.length === 0 && (
        <div className="kids-card p-10 text-center text-sm font-bold text-zinc-500">Todavía no hay ebooks para descargar.</div>
      )}

      {cats.map((slug) => {
        const dbCat = catMap.get(slug) as { name?: string; color?: string } | undefined;
        const meta = categoryMeta(slug);
        const catName = dbCat?.name ?? meta.name;
        const catColor = dbCat?.color ?? meta.color;
        return (
          <section key={slug}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: catColor }} />
              {catName}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {byCat.get(slug)!.map((it) => (
                <div key={`${it.kind}-${it.id}`} className="kids-card flex flex-col overflow-hidden">
                  <a href={`${it.downloadHref}?inline=1`} target="_blank" rel="noopener noreferrer" className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-200 via-fuchsia-200 to-sky-200 p-2">
                    {it.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.cover_url} alt={it.title} className="h-full w-full rounded-lg bg-white object-contain shadow-sm" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-white/80" />
                    )}
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black text-kids-700 backdrop-blur">
                      {it.pages} pág.
                    </span>
                  </a>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-black text-zinc-800">{it.title}</h3>
                    <p className="mt-0.5 text-[11px] font-bold text-zinc-400">{it.age_min}–{it.age_max} años</p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <DownloadPdfButton
                        url={it.downloadHref}
                        filename={it.title}
                        className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                      />
                      <OpenPdfLink url={it.downloadHref} className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500" label="" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="pb-4 text-center text-xs font-semibold text-zinc-400">
        Los PDF incluyen portada, todas las páginas y numeración.
      </p>
    </div>
  );
}

