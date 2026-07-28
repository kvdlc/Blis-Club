import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Flame, BookOpen, Play, Film, Plus, Star, ExternalLink, Trash2 } from "lucide-react";

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
  const typeLabel: Record<string, string> = { book: "Libro", video: "Video", movie: "Película" };
  const catColor: Record<string, string> = {
    motivacion: "bg-orange-600/10 text-orange-500 border-orange-600/20",
    seduccion: "bg-pink-600/10 text-pink-500 border-pink-600/20",
    negocios: "bg-blue-600/10 text-blue-500 border-blue-600/20",
    disciplina: "bg-red-600/10 text-red-500 border-red-600/20",
    otro: "bg-zinc-600/10 text-zinc-500 border-zinc-600/20",
  };

  const itemsByType = {
    book: items.filter((i: any) => i.type === "book"),
    video: items.filter((i: any) => i.type === "video"),
    movie: items.filter((i: any) => i.type === "movie"),
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Motivación</h1>
          <p className="text-xs text-zinc-500">Libros, videos y películas que te inspiran</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-zinc-100">
          <Flame className="w-12 h-12 text-zinc-300 mb-3" />
          <h2 className="text-lg font-bold text-zinc-700">Tu biblioteca está vacía</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">
            Agrega libros, videos y películas que te motiven a crecer.
          </p>
          <button className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors active:scale-95">
            Agregar recurso
          </button>
        </div>
      ) : (
        <>
          {/* Books */}
          {itemsByType.book.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-zinc-700">Libros</h2>
                <span className="text-xs text-zinc-400">({itemsByType.book.length})</span>
              </div>
              <div className="space-y-2">
                {itemsByType.book.map((item: any) => {
                  const Icon = typeIcon[item.type];
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zinc-800">{item.title}</h3>
                          {item.completed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Completado</span>
                          )}
                        </div>
                        {item.author && <p className="text-xs text-zinc-500">{item.author}</p>}
                        {item.notes && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>}
                        {item.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Videos */}
          {itemsByType.video.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-zinc-700">Videos</h2>
                <span className="text-xs text-zinc-400">({itemsByType.video.length})</span>
              </div>
              <div className="space-y-2">
                {itemsByType.video.map((item: any) => {
                  const Icon = typeIcon[item.type];
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zinc-800">{item.title}</h3>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${catColor[item.category] || catColor.otro}`}>
                            {item.category}
                          </span>
                          {item.completed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Visto</span>
                          )}
                        </div>
                        {item.notes && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>}
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Movies */}
          {itemsByType.movie.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-zinc-700">Películas</h2>
                <span className="text-xs text-zinc-400">({itemsByType.movie.length})</span>
              </div>
              <div className="space-y-2">
                {itemsByType.movie.map((item: any) => {
                  const Icon = typeIcon[item.type];
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zinc-800">{item.title}</h3>
                          {item.completed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Vista</span>
                          )}
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`} />
                            ))}
                          </div>
                        )}
                        {item.notes && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>}
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
