"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, BookOpen, Play, Film, Star, ExternalLink, Plus, X, Save, Trash2, Check, ArrowLeft, Music, Headphones, MessageCircle } from "lucide-react";
import FrasesDeSeduccion from "./FrasesDeSeduccion";

const CATEGORIES: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  motivacion: { label: "Motivación", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: Flame },
  seduccion: { label: "Seducción", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", icon: Flame },
  negocios: { label: "Negocios", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Flame },
  disciplina: { label: "Disciplina", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: Flame },
  emprendimiento: { label: "Emprendimiento", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Flame },
  habilidades_blandas: { label: "Hab. Blandas", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", icon: Flame },
  conocimiento: { label: "Conocimiento", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", icon: Flame },
  vestimenta: { label: "Vestimenta", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: Flame },
  mentalidad: { label: "Mentalidad", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Flame },
  relaciones: { label: "Relaciones", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: Flame },
  finanzas_personales: { label: "Finanzas", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: Flame },
  liderazgo: { label: "Liderazgo", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Flame },
  otro: { label: "Otro", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20", icon: Flame },
};

const TYPES: Record<string, { icon: any; label: string }> = {
  book: { icon: BookOpen, label: "Libro" },
  video: { icon: Play, label: "Video" },
  movie: { icon: Film, label: "Película" },
  audio: { icon: Headphones, label: "Audio" },
};

const ALL_CATEGORIES = ["motivacion", "seduccion", "negocios", "disciplina", "emprendimiento", "habilidades_blandas", "conocimiento", "vestimenta", "mentalidad", "relaciones", "finanzas_personales", "liderazgo", "otro"];

export default function MotivacionPage() {
  const [view, setView] = useState<"grid" | "detail" | "frases">("grid");
  const [selectedCat, setSelectedCat] = useState("");
  const [showFrases, setShowFrases] = useState(false);
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

  const openEditor = (item?: any, category?: string) => {
    if (item) {
      setEditingItem(item);
      setForm({ title: item.title, type: item.type, category: item.category, author: item.author || "", url: item.url || "", notes: item.notes || "", rating: item.rating || 0 });
    } else {
      setEditingItem(null);
      setForm({ title: "", type: "book", category: category || selectedCat || "motivacion", author: "", url: "", notes: "", rating: 0 });
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
    await supabase.from("spartan_motivation_items").update({ completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : null }).eq("id", item.id);
    await loadItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await createClient().from("spartan_motivation_items").delete().eq("id", id);
    await loadItems();
  };

  const catCounts = ALL_CATEGORIES.map(cat => ({
    key: cat,
    ...CATEGORIES[cat],
    count: items.filter(i => i.category === cat).length,
    completed: items.filter(i => i.category === cat && i.completed).length,
  })).filter(c => c.count > 0);

  // If a category has items but isn't in the static list, show it too
  const extraCats = items.filter(i => !ALL_CATEGORIES.includes(i.category));
  const extraCatNames = [...new Set(extraCats.map(i => i.category))];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {view === "detail" ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setView("grid")} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-zinc-400" /></button>
              <div>
                <h1 className="text-lg font-extrabold text-white">{CATEGORIES[selectedCat]?.label || selectedCat}</h1>
                <p className="text-xs text-zinc-500">{items.filter(i => i.category === selectedCat).length} recursos</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><Flame className="w-5 h-5 text-orange-400" /></div>
                <div>
                  <h1 className="text-xl font-extrabold text-white">Motivación</h1>
                  <p className="text-xs text-zinc-500">Libros, videos, películas y más</p>
                </div>
              </div>
            </>
          )}
        </div>
        <button onClick={() => openEditor()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold active:scale-[0.97] shadow-[0_0_15px_rgba(190,11,60,0.3)]">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {/* ── GRID VIEW: Category cards ── */}
      {view === "grid" && (
        <>
          {/* Frases de seducción card */}
          <button
            onClick={() => { setView("frases"); setShowFrases(true); }}
            className="w-full rounded-2xl border overflow-hidden hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all active:scale-[0.98] relative bg-gradient-to-br from-pink-950/50 via-zinc-900 to-zinc-900 p-5 text-left"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-spartan-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-white">Frases de Seducción</h2>
                <p className="text-xs text-zinc-400">220+ frases por categoría · Tutorial incluido</p>
              </div>
              <span className="text-pink-400 text-sm font-bold">Entrar →</span>
            </div>
          </button>

          {catCounts.length === 0 && extraCatNames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              <Flame className="w-12 h-12 text-zinc-700 mb-3" />
              <h2 className="text-lg font-bold text-zinc-300">Tu biblioteca está vacía</h2>
              <p className="text-sm text-zinc-500 mt-1">Libros, videos y películas que te inspiran.</p>
              <button onClick={() => openEditor()} className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold active:scale-95 shadow-[0_0_20px_rgba(190,11,60,0.3)]">Agregar recurso</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {catCounts.map((cat, i) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setSelectedCat(cat.key); setView("detail"); }}
                  className={`aspect-square rounded-2xl border overflow-hidden hover:border-white/[0.10] hover:shadow-lg transition-all active:scale-[0.97] text-left relative ${cat.bg}`}
                >
                  <div className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <cat.icon className={`w-6 h-6 ${cat.color} mb-2`} />
                      <p className="text-sm font-extrabold text-white">{cat.label}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-400">{cat.count} recursos</p>
                      {cat.completed > 0 && (
                        <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{cat.completed} completados</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Empty state for new category cards */}
              {ALL_CATEGORIES.filter(c => !catCounts.find(cc => cc.key === c)).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCat(cat); setView("detail"); }}
                  className="aspect-square rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all active:scale-[0.97] text-left relative p-4 flex flex-col justify-between opacity-50 hover:opacity-80"
                >
                  <div>
                    <Flame className="w-6 h-6 text-zinc-700 mb-2" />
                    <p className="text-sm font-extrabold text-zinc-500">{CATEGORIES[cat]?.label || cat}</p>
                  </div>
                  <p className="text-xs text-zinc-700">0 recursos</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── DETAIL VIEW: Items of a category ── */}
      {view === "detail" && (
        <div className="space-y-2">
          {items.filter(i => i.category === selectedCat).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-zinc-500">No hay recursos en esta categoría</p>
              <button onClick={() => openEditor(undefined, selectedCat)} className="mt-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400 hover:bg-white/10">Agregar recurso</button>
            </div>
          ) : (
            items.filter(i => i.category === selectedCat).map((item: any, i: number) => {
              const cat = CATEGORIES[item.category] || CATEGORIES.otro;
              const TypeIcon = TYPES[item.type]?.icon || BookOpen;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`bg-white/[0.03] border rounded-2xl overflow-hidden ${item.completed ? "border-emerald-500/20" : "border-white/[0.06]"}`}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleComplete(item)} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-[0.95] ${item.completed ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06]"}`}>
                        <Check className={`w-5 h-5 ${item.completed ? "text-emerald-400" : "text-zinc-600"}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-bold ${item.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{item.title}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-500 flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />{TYPES[item.type]?.label || item.type}
                          </span>
                          {item.completed && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Hecho</span>}
                        </div>
                        {item.author && <p className="text-xs text-zinc-500 mt-1">{item.author}</p>}
                        {item.notes && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>}
                        {item.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-1.5">
                            {[1,2,3,4,5].map(si => (<Star key={si} className={`w-3 h-3 ${si <= item.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.url && <a href={item.url} target="_blank" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><ExternalLink className="w-3.5 h-3.5 text-zinc-500" /></a>}
                        <button onClick={() => openEditor(item)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-400"><Star className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-700 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── FRASES VIEW ── */}
      {showFrases && (
        <FrasesDeSeduccion onBack={() => { setShowFrases(false); setView("grid"); }} />
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowEditor(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="relative bg-zinc-900 border border-white/[0.08] rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/[0.06] z-10">
                <h2 className="text-base font-extrabold text-white">{editingItem ? "Editar" : "Agregar recurso"}</h2>
                <button onClick={() => setShowEditor(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Título" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tipo</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(TYPES).map(([k, v]) => (
                        <button key={k} onClick={() => setForm({...form, type: k})} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${form.type === k ? "bg-spartan-600/20 border border-spartan-500/30 text-spartan-400" : "bg-white/[0.03] border border-white/[0.06] text-zinc-400"}`}>{v.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Categoría</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full mt-1 px-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-spartan-500/50">
                      {Object.entries(CATEGORIES).map(([k, v]) => (<option key={k} value={k} className="bg-zinc-900">{v.label}</option>))}
                    </select>
                  </div>
                </div>

                <input type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Autor / Creador" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                <input type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="Link (YouTube, web...)" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Notas..." className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50 resize-none" />

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Calificación</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (<button key={n} onClick={() => setForm({...form, rating: n})} className="p-1"><Star className={`w-6 h-6 ${n <= form.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} /></button>))}
                  </div>
                </div>

                <button onClick={saveItem} disabled={saving || !form.title.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
                  {saving ? "..." : <><Save className="w-4 h-4" /> {editingItem ? "Actualizar" : "Agregar"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
