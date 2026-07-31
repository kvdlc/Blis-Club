import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Flame, BookOpen, Play, Film, Star, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMotivationItems(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("spartan_motivation_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function MotivacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const items = await getMotivationItems(user.id);

  const typeIcon: Record<string, any> = { book: BookOpen, video: Play, movie: Film };
  const catColor: Record<string, string> = {
    motivacion: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    seduccion: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    negocios: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    disciplina: "bg-spartan-500/10 text-spartan-400 border-spartan-500/20",
    emprendimiento: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    habilidades_blandas: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    conocimiento: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    vestimenta: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    mentalidad: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    relaciones: "bg-red-500/10 text-red-400 border-red-500/20",
    finanzas_personales: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    liderazgo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    otro: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const itemsByType = {
    book: items.filter((i: any) => i.type === "book"),
    video: items.filter((i: any) => i.type === "video"),
    movie: items.filter((i: any) => i.type === "movie"),
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Motivación</h1>
          <p className="text-xs text-zinc-500">Libros, videos y películas que te inspiran</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl">
          <Flame className="w-12 h-12 text-zinc-700 mb-3" />
          <h2 className="text-lg font-bold text-zinc-300">Tu biblioteca está vacía</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">Agrega libros, videos y películas que te motiven a crecer.</p>
          <button className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-95 shadow-[0_0_20px_rgba(190,11,60,0.3)]">Agregar recurso</button>
        </div>
      ) : (
        <>
          {Object.entries(itemsByType).map(([type, typeItems]) => {
            if (typeItems.length === 0) return null;
            const label: Record<string, string> = { book: "Libros", video: "Videos", movie: "Películas" };
            const iconColor: Record<string, string> = { book: "text-amber-400", video: "text-blue-400", movie: "text-purple-400" };
            const bgColor: Record<string, string> = { book: "bg-amber-500/10 border-amber-500/20", video: "bg-blue-500/10 border-blue-500/20", movie: "bg-purple-500/10 border-purple-500/20" };
            const sectionIcon = { book: BookOpen, video: Play, movie: Film };

            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-3">
                  {(() => { const Icon = sectionIcon[type as keyof typeof sectionIcon]; return <Icon className={`w-4 h-4 ${iconColor[type]}`} />; })()}
                  <h2 className="text-sm font-bold text-zinc-300">{label[type]}</h2>
                  <span className="text-xs text-zinc-600">({typeItems.length})</span>
                </div>
                <div className="space-y-2">
                  {typeItems.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bgColor[type]}`}>
                        {(() => { const Icon = typeIcon[item.type]; return <Icon className={`w-5 h-5 ${iconColor[type]}`} />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zinc-200">{item.title}</h3>
                          {item.type !== "book" && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${catColor[item.category] || catColor.otro}`}>{item.category}</span>
                          )}
                          {item.completed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completado</span>
                          )}
                        </div>
                        {item.author && <p className="text-xs text-zinc-500">{item.author}</p>}
                        {item.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                            ))}
                          </div>
                        )}
                        {item.notes && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.notes}</p>}
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
