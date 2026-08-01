"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, Check, Star, Copy, Dices, ChevronDown, ChevronUp, Sparkles, Info, Trash2, ArrowLeft, MessageCircle, Save } from "lucide-react";
import { PHRASE_CATEGORIES, PRINCIPLES } from "./frases-data";

const FAV_KEY = "spartan_frases_favs";
const CUSTOM_KEY = "spartan_frases_custom";
const TUTORIAL_KEY = "spartan_frases_tutorial_done";

interface Props {
  onBack: () => void;
}

export default function FrasesDeSeduccion({ onBack }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["aproximacion_generica"]));
  const [search, setSearch] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ text: "", category: "aproximacion_generica" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteAnim, setFavoriteAnim] = useState<string | null>(null);
  const [fraseDia, setFraseDia] = useState<{ text: string; cat: string } | null>(null);

  useEffect(() => {
    try {
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(new Set(JSON.parse(f)));
      const c = localStorage.getItem(CUSTOM_KEY);
      if (c) setCustom(JSON.parse(c));
      const tut = localStorage.getItem(TUTORIAL_KEY);
      if (!tut) setShowTutorial(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch {}
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)); } catch {}
  }, [custom]);

  const allCategories = useMemo(() => {
    return PHRASE_CATEGORIES.map(cat => ({
      ...cat,
      phrases: [...(custom[cat.key] || []), ...cat.phrases],
    }));
  }, [custom]);

  const allPhrases = useMemo(() => {
    const list: { text: string; category: string }[] = [];
    for (const cat of allCategories) {
      for (const p of cat.phrases) list.push({ text: p, category: cat.key });
    }
    return list;
  }, [allCategories]);

  // Random phrase of the moment
  const pickFraseDia = useCallback(() => {
    if (allPhrases.length === 0) return;
    const p = allPhrases[Math.floor(Math.random() * allPhrases.length)];
    const catLabel = allCategories.find(c => c.key === p.category)?.label || "";
    setFraseDia({ text: p.text, cat: catLabel });
  }, [allPhrases, allCategories]);

  useEffect(() => { pickFraseDia(); }, [pickFraseDia]);

  const toggleFavorite = (text: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
    setFavoriteAnim(text);
    setTimeout(() => setFavoriteAnim(null), 600);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 1500);
      if (navigator.vibrate) navigator.vibrate(10);
    } catch {}
  };

  const toggleCategory = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addPhrase = () => {
    const text = addForm.text.trim();
    if (!text) return;
    setCustom(prev => ({
      ...prev,
      [addForm.category]: [...(prev[addForm.category] || []), text],
    }));
    setAddForm({ text: "", category: addForm.category });
    setShowAdd(false);
    setExpanded(prev => new Set(prev).add(addForm.category));
  };

  const removeCustom = (catKey: string, phrase: string) => {
    setCustom(prev => ({
      ...prev,
      [catKey]: (prev[catKey] || []).filter(p => p !== phrase),
    }));
  };

  const totalFavs = favorites.size;
  const filteredCat = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCategories.map(cat => {
      const all = cat.phrases;
      const favs = all.filter(p => favorites.has(p) && (!q || p.toLowerCase().includes(q)));
      const rest = all.filter(p => !favorites.has(p) && (!q || p.toLowerCase().includes(q)));
      return { ...cat, favs, rest };
    }).filter(cat => cat.favs.length > 0 || cat.rest.length > 0);
  }, [allCategories, favorites, search]);

  const closeTutorial = () => {
    setShowTutorial(false);
    try { localStorage.setItem(TUTORIAL_KEY, "done"); } catch {}
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-zinc-400" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-white">Frases de Seducción</h1>
          <p className="text-xs text-zinc-500">{allPhrases.length} frases · ⭐ {totalFavs} favoritas</p>
        </div>
        <button onClick={() => setShowTutorial(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold hover:bg-white/10">
          <Info className="w-3 h-3" /> Tutorial
        </button>
      </div>

      {/* Frase del momento */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl p-4 overflow-hidden border border-pink-500/20 bg-gradient-to-br from-spartan-950/60 via-zinc-900 to-pink-950/30">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Frase del momento</p>
        </div>
        {fraseDia && (
          <AnimatePresence mode="wait">
            <motion.p key={fraseDia.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm font-bold text-zinc-100 leading-relaxed italic">
              &ldquo;{fraseDia.text}&rdquo;
            </motion.p>
          </AnimatePresence>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-zinc-500">{fraseDia?.cat}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => fraseDia && copyText(fraseDia.text)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10">
              {copiedId === fraseDia?.text ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => fraseDia && toggleFavorite(fraseDia.text)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Star className={`w-3.5 h-3.5 ${favorites.has(fraseDia?.text || "") ? "text-amber-400 fill-amber-400" : "text-zinc-400"}`} />
            </button>
            <button onClick={pickFraseDia} className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 hover:bg-pink-500/30">
              <Dices className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar frase..." className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-zinc-500" /></button>}
      </div>

      {/* Add button */}
      <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-pink-500/30 text-pink-400 text-xs font-bold hover:bg-pink-500/5 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Agregar mi propia frase
      </button>

      {/* Categories accordion */}
      <div className="space-y-2">
        {filteredCat.map(cat => {
          const isOpen = expanded.has(cat.key);
          return (
            <div key={cat.key} className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02]">
              {/* Header */}
              <button onClick={() => toggleCategory(cat.key)} className="w-full flex items-center gap-2.5 p-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-zinc-200">{cat.label}</p>
                  <p className="text-[10px] text-zinc-500">
                    {cat.favs.length + cat.rest.length} frases
                    {cat.favs.length > 0 && <span className="text-amber-400"> · ⭐ {cat.favs.length}</span>}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
              </button>

              {/* Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-3 pb-3 space-y-1.5">
                      {/* Favorites first */}
                      {cat.favs.length > 0 && (
                        <>
                          <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest pt-1">⭐ Favoritas</p>
                          {cat.favs.map((p, i) => (
                            <PhraseCard key={p} text={p} isFav onToggleFav={() => toggleFavorite(p)} onCopy={() => copyText(p)} copied={copiedId === p} animating={favoriteAnim === p} isCustom={custom[cat.key]?.includes(p)} onRemoveCustom={custom[cat.key]?.includes(p) ? () => removeCustom(cat.key, p) : undefined} delay={i} />
                          ))}
                        </>
                      )}
                      {cat.rest.map((p, i) => (
                        <PhraseCard key={p} text={p} onToggleFav={() => toggleFavorite(p)} onCopy={() => copyText(p)} copied={copiedId === p} animating={favoriteAnim === p} isCustom={custom[cat.key]?.includes(p)} onRemoveCustom={custom[cat.key]?.includes(p) ? () => removeCustom(cat.key, p) : undefined} delay={cat.favs.length + i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredCat.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">Sin resultados</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between px-1 pt-2">
        <p className="text-xs font-bold text-zinc-400">{allPhrases.length} frases</p>
        <p className="text-xs text-zinc-600">⭐ {totalFavs} favoritas</p>
      </div>

      {/* Tutorial modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto" onClick={closeTutorial}>
            <div className="max-w-md mx-auto px-5 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-white">Dominio de la Comunicación</h2>
                <button onClick={closeTutorial} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <p className="text-xs text-zinc-500 mb-6">Los 7 principios para usar las frases con impacto real.</p>

              <div className="space-y-3">
                {PRINCIPLES.map(p => (
                  <motion.div key={p.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: p.num * 0.05 }} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-spartan-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">{p.num}</span>
                      <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{p.text}</p>
                    {p.example && (
                      <p className="text-xs text-pink-300/90 italic mt-2 border-l-2 border-pink-500/30 pl-3">&ldquo;{p.example}&rdquo;</p>
                    )}
                  </motion.div>
                ))}
              </div>

              <button onClick={closeTutorial} className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-spartan-600 to-pink-600 text-white text-sm font-bold active:scale-[0.97] shadow-[0_0_30px_rgba(190,11,60,0.3)]">
                Entendido, a practicar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowAdd(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="relative bg-zinc-900 border border-white/[0.08] rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-white">Nueva frase</h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <textarea value={addForm.text} onChange={e => setAddForm({ ...addForm, text: e.target.value })} rows={3} placeholder="Escribe tu frase..." className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 resize-none" />
              <div className="mt-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Categoría</label>
                <select value={addForm.category} onChange={e => setAddForm({ ...addForm, category: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:outline-none">
                  {PHRASE_CATEGORIES.map(c => (<option key={c.key} value={c.key} className="bg-zinc-900">{c.emoji} {c.label}</option>))}
                </select>
              </div>
              <button onClick={addPhrase} disabled={!addForm.text.trim()} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-spartan-600 to-pink-600 text-white text-sm font-bold active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
                <Save className="w-4 h-4" /> Agregar frase
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhraseCard({ text, isFav, onToggleFav, onCopy, copied, animating, isCustom, onRemoveCustom, delay }: {
  text: string;
  isFav?: boolean;
  onToggleFav: () => void;
  onCopy: () => void;
  copied: boolean;
  animating: boolean;
  isCustom?: boolean;
  onRemoveCustom?: () => void;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(delay * 0.03, 0.3) }} className={`relative flex items-center gap-2 p-3 rounded-xl border transition-all ${isFav ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/[0.04]"}`}>
      {isFav && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-500" />}
      <p className={`flex-1 text-xs leading-relaxed ${isFav ? "text-zinc-200" : "text-zinc-300"}`}>
        {isCustom && <span className="text-[9px] font-bold text-pink-400 mr-1">TUYA</span>}
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-1 shrink-0">
        {onRemoveCustom && (
          <button onClick={onRemoveCustom} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-700 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
        )}
        <button onClick={onCopy} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
        <button onClick={onToggleFav} className="w-6 h-6 rounded-full flex items-center justify-center">
          <motion.div animate={animating ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.4 }}>
            <Star className={`w-3.5 h-3.5 ${isFav ? "text-amber-400 fill-amber-400" : "text-zinc-600 hover:text-zinc-400"}`} />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}
