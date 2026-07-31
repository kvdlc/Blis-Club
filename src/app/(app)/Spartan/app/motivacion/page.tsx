"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, BookOpen, Play, Film, Star, ExternalLink, Plus, X, Save, Trash2, Check, Eye } from "lucide-react";

const CATEGORIES: Record<string, { label: string; color: string; icon: any }> = {
  motivacion: { label: "Motivación", color: "border-orange-500/20 bg-orange-500/10 text-orange-400", icon: Flame },
  seduccion: { label: "Seducción", color: "border-pink-500/20 bg-pink-500/10 text-pink-400", icon: Flame },
  negocios: { label: "Negocios", color: "border-blue-500/20 bg-blue-500/10 text-blue-400", icon: Flame },
  disciplina: { label: "Disciplina", color: "border-red-500/20 bg-red-500/10 text-red-400", icon: Flame },
  emprendimiento: { label: "Emprendimiento", color: "border-amber-500/20 bg-amber-500/10 text-amber-400", icon: Flame },
  habilidades_blandas: { label: "Habilidades Blandas", color: "border-teal-500/20 bg-teal-500/10 text-teal-400", icon: Flame },
  conocimiento: { label: "Conocimiento", color: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400", icon: Flame },
  vestimenta: { label: "Vestimenta", color: "border-rose-500/20 bg-rose-500/10 text-rose-400", icon: Flame },
  mentalidad: { label: "Mentalidad", color: "border-violet-500/20 bg-violet-500/10 text-violet-400", icon: Flame },
  relaciones: { label: "Relaciones", color: "border-red-500/20 bg-red-500/10 text-red-400", icon: Flame },
  finanzas_personales: { label: "Finanzas Personales", color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400", icon: Flame },
  liderazgo: { label: "Liderazgo", color: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400", icon: Flame },
  otro: { label: "Otro", color: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400", icon: Flame },
};

const TYPES: Record<string, { icon: any; label: string }> = {
  book: { icon: BookOpen, label: "Libro" },
  video: { icon: Play, label: "Video" },
  movie: { icon: Film, label: "Película" },
};

export default function MotivacionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", type: "book", category: "motivacion", author: "", url: "", notes: "", rating: 0 });
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");

  const loadItems = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("spartan_motivation_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const openEditor = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({ title: item.title, type: item.type, category: item.category, author: item.author || "", url: item.url || "", notes: item.notes || "", rating: item.rating || 0 });
    } else {
      setEditingItem(null);
      setForm({ title: "", type: "book", category: "motivacion", author: "", url: "", notes: "", rating: 0 });
    }
    setShowEditor(true);
  };

  const saveItem = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const data = { user_id: userId, title: form.title.trim(), type: form.type, category: form.category, author: form.author || null, url: form.url || null, notes: form.notes || null, rating: form.rating || null };
    if (editingItem) {
      await supabase.from("spartan_motivation_items").update(data).eq("id", editingItem.id);
    } else {
      await supabase.from("spartan_motivation_items").insert(data);
    }
    setSaving(false); setShowEditor(false);
    await loadItems();
  };

  const toggleComplete = async (item: any) => {
    const supabase = createClient();
    const completed = !item.completed;
    await supabase.from("spartan_motivation_items").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", item.id);
    await loadItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    await createClient().from("spartan_motivation_items").delete().eq("id", id);
    await loadItems();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Motivación</h1>
            <p className="text-xs text-zinc-500">Libros, videos y películas</p>
          </div>
        </div>
        <button onClick={() => openEditor()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold active:scale-[0.97] shadow-[0_0_15px_rgba(190,11,60,0.3)]">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <Flame className="w-12 h-12 text-zinc-700 mb-3" />
          <h2 className="text-lg font-bold text-zinc-300">Tu biblioteca está vacía</h2>
          <p className="text-sm text-zinc-500 mt-1">Libros, videos y películas que te inspiran.</p>
          <button onClick={() => openEditor()} className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold active:scale-95 shadow-[0_0_20px_rgba(190,11,60,0.3)]">Agregar recurso</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item: any, i) => {
            const TypeIcon = TYPES[item.type]?.icon || BookOpen;
            const cat = CATEGORIES[item.category] || CATEGORIES.otro;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/[0.03] border rounded-2xl overflow-hidden hover:border-white/[0.08] transition-all ${item.completed ? "border-emerald-500/20" : "border-white/[0.06]"}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <button onClick={() => toggleComplete(item)} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-[0.95] ${item.completed ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"}`}>
                      <Check className={`w-5 h-5 ${item.completed ? "text-emerald-400" : "text-zinc-600"}`} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-bold ${item.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{item.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>{cat.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-500">
                          {TypeIcon && <TypeIcon className="w-3 h-3 inline mr-1" />}
                          {TYPES[item.type]?.label || item.type}
                        </span>
                        {item.completed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completado</span>
                        )}
                      </div>

                      {item.author && <p className="text-xs text-zinc-500 mt-1">{item.author}</p>}
                      {item.notes && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>}

                      {/* Rating stars */}
                      {item.rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`w-3 h-3 ${si < item.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        </a>
                      )}
                      <button onClick={() => openEditor(item)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-700 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowEditor(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="relative bg-zinc-900 border border-white/[0.08] rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/[0.06] z-10">
                <h2 className="text-base font-extrabold text-white">{editingItem ? "Editar recurso" : "Agregar recurso"}</h2>
                <button onClick={() => setShowEditor(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Título</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej: Padre Rico Padre Pobre" className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tipo</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(TYPES).map(([k, v]) => (
                        <button key={k} onClick={() => setForm({...form, type: k})} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${form.type === k ? "bg-spartan-600/20 border border-spartan-500/30 text-spartan-400" : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"}`}>{v.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Categoría</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-spartan-500/50">
                      {Object.entries(CATEGORIES).map(([k, v]) => (
                        <option key={k} value={k} className="bg-zinc-900">{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Autor / Creador</label>
                  <input type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Robert Kiyosaki" className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Link</label>
                  <input type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Notas</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Apuntes personales..." className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50 resize-none" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Calificación</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setForm({...form, rating: n})} className="p-1">
                        <Star className={`w-6 h-6 ${n <= form.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={saveItem} disabled={saving || !form.title.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
                  {saving ? "..." : <><Save className="w-4 h-4" /> {editingItem ? "Actualizar" : "Agregar recurso"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
