"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, UtensilsCrossed, Save, X, ChevronDown, ChevronUp, Sparkles, Camera, Image as ImageIcon, Loader2, Search, Filter, Check } from "lucide-react";
import AIGenerateModal from "@/components/admin/AIGenerateModal";
import { ImageEditor } from "@/components/ImageEditor";
import { uploadRecipeImage } from "@/lib/storage";

// ─── Tipos ───
interface Recipe {
  id: string; title: string; description: string; category: string;
  image_url: string; video_url: string | null; is_therapeutic: boolean; health_tags: string[];
  prep_time_min: number; difficulty: string; kcal_per_100g: number;
  is_detox: boolean; source_book: string; protein_type: string;
}
interface Ingredient { id: string; recipe_id: string; ingredient_name: string; quantity_per_serving_g: number; ingredient_type: string; unit_type: string; unit_weight_g: number; display_unit: string | null; }
interface Step { id: string; recipe_id: string; step_number: number; instruction: string; duration_min: number; image_url: string; }
interface NutritionFact { id?: string; recipe_id: string; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number; moisture_g: number; ash_g: number; calcium_mg: number; phosphorus_mg: number; iron_mg: number; zinc_mg: number; vitamin_a_ui: number; vitamin_d_ui: number; vitamin_e_mg: number; omega3_g: number; omega6_g: number; }

const CATEGORIES = ["diario", "snack", "helado", "pastel", "croquetas"];
const DIFFICULTIES = ["facil", "medio", "avanzado"];
const INGREDIENT_TYPES = ["proteina", "hueso", "viscera", "vegetal", "suplemento", "otro"];
const TAG_OPTIONS = ["sin gluten", "sin lacteos", "hipoalergenico", "alto en proteina", "bajo en grasa", "renal", "hepatico", "diabetico", "cardiaco", "digestivo", "articular"];

const emptyRecipe = { title: "", description: "", category: "diario", image_url: "", video_url: "", is_therapeutic: false, health_tags: [] as string[], prep_time_min: 15, difficulty: "facil", kcal_per_100g: 0, is_detox: false, source_book: "", protein_type: "", breed_sizes: [] as string[] };
const emptyFacts: NutritionFact = { recipe_id: "", protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, moisture_g: 0, ash_g: 0, calcium_mg: 0, phosphorus_mg: 0, iron_mg: 0, zinc_mg: 0, vitamin_a_ui: 0, vitamin_d_ui: 0, vitamin_e_mg: 0, omega3_g: 0, omega6_g: 0 };

export default function NutricionPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyRecipe);

  // Sub-entities
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [facts, setFacts] = useState<NutritionFact>(emptyFacts);
  const [newIngredient, setNewIngredient] = useState({ ingredient_name: "", quantity_per_serving_g: 0, ingredient_type: "otro", unit_type: "g", unit_weight_g: 1, display_unit: "" });
  const [newStep, setNewStep] = useState({ instruction: "", duration_min: 0 });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAIModal, setShowAIModal] = useState(false);

  // Image generation / editor
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageEditorUrl, setImageEditorUrl] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterProtein, setFilterProtein] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "az" | "therapeutic">("recent");

  const appSlug = () => { try { return localStorage.getItem("blis_active_app_slug") || "guau"; } catch { return "guau"; } };

  const existingProteinTypes = useMemo(() => {
    const types = [...new Set(recipes.map((r) => r.protein_type).filter(Boolean))];
    return types.sort();
  }, [recipes]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/recipes?app=${appSlug()}`);
    const j = await r.json();
    setRecipes(j.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadSubEntities = async (recipeId: string) => {
    const [ingR, stepR, factR] = await Promise.all([
      fetch(`/api/admin/recipe-ingredients?recipe_id=${recipeId}`).then(r => r.json()),
      fetch(`/api/admin/recipe-steps?recipe_id=${recipeId}`).then(r => r.json()),
      fetch(`/api/admin/recipe-nutrition?recipe_id=${recipeId}`).then(r => r.json()),
    ]);
    setIngredients(ingR.data || []);
    setSteps(stepR.data || []);
    setFacts(factR.data || { ...emptyFacts, recipe_id: recipeId });
  };

  const getAppId = async () => {
    const r = await fetch("/api/admin/applications");
    const j = await r.json();
    return j.data?.find((a: any) => a.slug === appSlug())?.id;
  };

  const handleSave = async (recipeData?: Partial<typeof emptyRecipe>) => {
    setIsSaving(true);
    const appId = await getAppId();
    if (!appId) { setIsSaving(false); return; }

    const data = recipeData ? { ...emptyRecipe, ...recipeData } : form;

    if (editing) {
      await fetch("/api/admin/recipes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...data }) });
    } else {
      const r = await fetch("/api/admin/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, application_id: appId }) });
      const j = await r.json();
      if (j.data) {
        setEditing(j.data);
        setForm(j.data);
        loadSubEntities(j.data.id);
      }
    }
    setIsSaving(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    setShowNew(false);
    load();
  };

  const addIngredient = async () => {
    if (!editing || !newIngredient.ingredient_name) return;
    await fetch("/api/admin/recipe-ingredients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newIngredient, recipe_id: editing.id }) });
    setNewIngredient({ ingredient_name: "", quantity_per_serving_g: 0, ingredient_type: "otro", unit_type: "g", unit_weight_g: 1, display_unit: "" });
    loadSubEntities(editing.id);
  };

  const addStep = async () => {
    if (!editing || !newStep.instruction) return;
    await fetch("/api/admin/recipe-steps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newStep, recipe_id: editing.id, step_number: steps.length + 1 }) });
    setNewStep({ instruction: "", duration_min: 0 });
    loadSubEntities(editing.id);
  };

  const saveFacts = async () => {
    if (!editing) return;
    await fetch("/api/admin/recipe-nutrition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...facts, recipe_id: editing.id }) });
  };

  const handleEdit = (r: Recipe) => {
    setEditing(r);
    setForm({ title: r.title, description: r.description || "", category: r.category, image_url: r.image_url || "", video_url: r.video_url || "", is_therapeutic: r.is_therapeutic, health_tags: r.health_tags || [], prep_time_min: r.prep_time_min || 0, difficulty: r.difficulty, kcal_per_100g: r.kcal_per_100g || 0, is_detox: r.is_detox, source_book: r.source_book || "", protein_type: r.protein_type || "", breed_sizes: (r as any).breed_sizes || [] });
    setShowNew(false);
    loadSubEntities(r.id);
  };

  const handleAIGenerate = async (recipe: any) => {
    const aiRecipe = {
      title: recipe.title || "",
      description: recipe.description || "",
      category: recipe.category || "diario",
      image_url: recipe.image_url || "",
      video_url: recipe.video_url || "",
      is_therapeutic: recipe.is_therapeutic || false,
      health_tags: recipe.health_tags || [],
      prep_time_min: recipe.prep_time_min || 15,
      difficulty: recipe.difficulty || "facil",
      kcal_per_100g: recipe.kcal_per_100g || 0,
      is_detox: recipe.is_detox || false,
      source_book: recipe.source_book || "",
      protein_type: recipe.protein_type || "",
      breed_sizes: recipe.breed_sizes || [],
    };
    setForm(aiRecipe);

    const appId = await getAppId();
    if (!appId) return;

    // Save recipe
    const r = await fetch("/api/admin/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...aiRecipe, application_id: appId }) });
    const j = await r.json();
    if (!j.data?.id) return;
    const recipeId = j.data.id;
    setEditing(j.data);
    setForm(j.data);

    // Save AI-generated ingredients
    if (recipe.ingredients?.length) {
      await Promise.all(recipe.ingredients.map((ing: any) =>
        fetch("/api/admin/recipe-ingredients", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: recipeId,
            ingredient_name: ing.ingredient_name,
            quantity_per_serving_g: ing.quantity_per_serving_g || 0,
            ingredient_type: ing.ingredient_type || "otro",
            unit_type: ing.unit_type || "g",
            unit_weight_g: ing.unit_weight_g ?? 1,
            display_unit: ing.display_unit || ing.ingredient_name,
          })
        })
      ));
    }

    // Save AI-generated steps
    if (recipe.steps?.length) {
      await Promise.all(recipe.steps.map((step: any, idx: number) =>
        fetch("/api/admin/recipe-steps", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: recipeId,
            step_number: step.step_number || idx + 1,
            instruction: step.instruction,
            duration_min: step.duration_min || null,
            image_url: step.image_url || null,
          })
        })
      ));
    }

    // Save AI-generated nutrition facts
    if (recipe.nutrition_facts) {
      await fetch("/api/admin/recipe-nutrition", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...recipe.nutrition_facts, recipe_id: recipeId })
      });
    }

    loadSubEntities(recipeId);
    setShowNew(false);
    load();
  };

  const handleGenerateImage = async () => {
    if (!form.title) return alert("Guarda la receta primero (título obligatorio)");
    // Ensure recipe exists so we have an ID for storage path
    let recipeId = editing?.id;
    if (!recipeId) {
      const appId = await getAppId();
      if (!appId) return;
      const r = await fetch("/api/admin/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, application_id: appId }) });
      const j = await r.json();
      if (!j.data?.id) return alert("Error guardando receta");
      recipeId = j.data.id;
      setEditing(j.data);
      setForm(j.data);
    }

    setGeneratingImage(true);
    try {
      const recipeDescription = `${form.title}. ${form.description}`;
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeDescription, model: "flux-2-pro" }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageEditorUrl(data.imageUrl);
        setShowImageEditor(true);
      } else {
        alert(data.error || "Error generando imagen");
      }
    } catch (e) {
      alert("Error generando imagen");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleImageEditorSave = async (dataUrl: string) => {
    if (!editing?.id) return;
    const url = await uploadRecipeImage(dataUrl, editing.id);
    if (url) {
      setForm(f => ({ ...f, image_url: url }));
      // Also persist immediately to DB
      await fetch("/api/admin/recipes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, image_url: url }) });
    } else {
      alert("Error subiendo imagen");
    }
    setShowImageEditor(false);
  };

  const toggleTag = (tag: string) => {
    setForm(f => ({ ...f, health_tags: f.health_tags.includes(tag) ? f.health_tags.filter(t => t !== tag) : [...f.health_tags, tag] }));
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Nutrición</h1><p className="text-sm text-zinc-500 mt-1">Gestiona recetas, ingredientes, pasos y tabla nutricional</p></div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setShowNew(true); setForm(emptyRecipe); setIngredients([]); setSteps([]); setFacts(emptyFacts); }}
              className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
              <Plus className="w-4 h-4" /> Nueva Receta
            </button>
            <button onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 bg-accent-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-accent-700 active:scale-[0.97] transition-all">
              <Sparkles className="w-4 h-4" /> Generar con AI
            </button>
          </div>
        </div>

        {/* ─── RECIPE LIST ─── */}
        {!editing && !showNew && (
          loading ? <div className="text-center py-12 text-zinc-500">Cargando...</div> :
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar receta..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                <option value="">Todas las cats</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterProtein} onChange={e => setFilterProtein(e.target.value)} className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                <option value="">Todas las proteínas</option>
                {existingProteinTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                <option value="recent">Más reciente</option>
                <option value="az">A-Z</option>
                <option value="therapeutic">Terapéuticas primero</option>
              </select>
            </div>

            <div className="grid gap-3">
              {recipes
                .filter(r => {
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return r.title.toLowerCase().includes(q) || (r.description?.toLowerCase() || "").includes(q) || (r.protein_type?.toLowerCase() || "").includes(q);
                  }
                  return true;
                })
                .filter(r => !filterCategory || r.category === filterCategory)
                .filter(r => !filterProtein || r.protein_type === filterProtein)
                .sort((a, b) => {
                  if (sortBy === "az") return a.title.localeCompare(b.title);
                  if (sortBy === "therapeutic") return (b.is_therapeutic ? 1 : 0) - (a.is_therapeutic ? 1 : 0);
                  return 0; // recent = default server order
                })
                .map(r => (
                <div key={r.id} className="card-soft rounded-[1.25rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => handleEdit(r)}>
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} className="w-12 h-12 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-warning-100 dark:bg-warning-950 flex items-center justify-center text-warning-600"><UtensilsCrossed className="w-6 h-6" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{r.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600">{r.category}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600">{r.difficulty}</span>
                      {r.prep_time_min ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600">{r.prep_time_min}min</span> : null}
                      {r.protein_type && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{r.protein_type}</span>}
                      {r.is_therapeutic && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">Terapéutica</span>}
                      {(r as any).created_at && <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-400">{new Date((r as any).created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) fetch(`/api/admin/recipes?id=${r.id}`,{method:"DELETE"}).then(load); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RECIPE EDITOR ─── */}
        {(editing || showNew) && (
          <div className="space-y-6">
            {saveToast && (
              <div className="flex items-center gap-2 bg-secondary-50 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-800 rounded-xl px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 animate-in fade-in slide-in-from-top-2 duration-300">
                <Check className="w-4 h-4 text-secondary-500" />
                Receta guardada correctamente
              </div>
            )}
            <button onClick={() => { setEditing(null); setShowNew(false); load(); }} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"><X className="w-4 h-4" /> Cerrar editor</button>

            {/* Basic fields */}
            <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{editing ? `Editando: ${editing.title}` : "Nueva Receta"}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Título</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Categoría</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Dificultad</label>
                  <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Tiempo (min)</label>
                  <input type="number" value={form.prep_time_min} onChange={e => setForm({...form, prep_time_min: parseInt(e.target.value)||0})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Kcal/100g</label>
                  <input type="number" value={form.kcal_per_100g} onChange={e => setForm({...form, kcal_per_100g: parseInt(e.target.value)||0})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Proteína principal</label>
                  <select value={form.protein_type} onChange={e => { const val = e.target.value; if (val === "__new__") { setNewProtein(""); setForm(f => ({...f, protein_type: ""})); } else { setForm(f => ({...f, protein_type: val})); } }} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="">Sin especificar</option>
                    {existingProteinTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    <option value="__new__">+ Nueva proteína...</option>
                  </select>
                  {form.protein_type === "" && newProtein !== undefined && (
                    <input value={newProtein} onChange={e => { setNewProtein(e.target.value); setForm(f => ({...f, protein_type: e.target.value})); }} placeholder="Escribe la proteína..." className="w-full mt-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Imagen de la Receta</label>
                  <div className="flex items-center gap-3">
                    {form.image_url ? (
                      <button onClick={() => { setImageEditorUrl(form.image_url); setShowImageEditor(true); }} className="relative group shrink-0">
                        <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700" />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <ImageIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                      <div className="flex gap-2">
                        <button onClick={handleGenerateImage} disabled={generatingImage}
                          className="flex items-center gap-1.5 bg-accent-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-accent-700 disabled:opacity-50 transition-all">
                          {generatingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Generar con AI
                        </button>
                        <button onClick={() => { setImageEditorUrl(form.image_url || "https://placehold.co/400x400/EEE/999?text=Imagen"); setShowImageEditor(true); }}
                          className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-zinc-200 transition-all">
                          <Camera className="w-3 h-3" /> Subir / Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">URL Video (YouTube/Vimeo)</label>
                  <input value={form.video_url || ""} onChange={e => setForm({...form, video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setForm(f => ({...f, is_therapeutic: !f.is_therapeutic}))}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${form.is_therapeutic ? "border-secondary-400 bg-secondary-50 text-secondary-700" : "border-zinc-200 text-zinc-500"}`}>🏥 Terapéutica</button>
                <button onClick={() => setForm(f => ({...f, is_detox: !f.is_detox}))}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${form.is_detox ? "border-accent-400 bg-accent-50 text-accent-700" : "border-zinc-200 text-zinc-500"}`}>🧪 Detox</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Health Tags</label>
                <div className="flex flex-wrap gap-1.5">{TAG_OPTIONS.map(t => (
                  <button key={t} onClick={() => toggleTag(t)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${form.health_tags.includes(t) ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-200 text-zinc-500"}`}>{t}</button>
                ))}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Tamaños de raza (para croquetas)</label>
                <div className="flex flex-wrap gap-1.5">
                  {["miniatura", "pequena", "mediana", "grande", "gigante"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({...f, breed_sizes: f.breed_sizes.includes(s) ? f.breed_sizes.filter(x => x !== s) : [...f.breed_sizes, s] }))}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${form.breed_sizes.includes(s) ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-200 text-zinc-500"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Libro fuente</label>
                <input value={form.source_book} onChange={e => setForm({...form, source_book: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              <button onClick={() => handleSave()} disabled={isSaving} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-60">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Receta</>}
              </button>
            </div>

            {/* ═══ INGREDIENTS ═══ */}
            {editing && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Ingredientes ({ingredients.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <input placeholder="Nombre" value={newIngredient.ingredient_name} onChange={e => setNewIngredient({...newIngredient, ingredient_name: e.target.value})}
                    className="flex-1 min-w-[120px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <input type="number" placeholder="Gramos" value={newIngredient.quantity_per_serving_g || ""} onChange={e => setNewIngredient({...newIngredient, quantity_per_serving_g: parseInt(e.target.value)||0})}
                    className="w-24 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <select value={newIngredient.ingredient_type} onChange={e => setNewIngredient({...newIngredient, ingredient_type: e.target.value})}
                    className="w-32 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">{INGREDIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <select value={newIngredient.unit_type} onChange={e => setNewIngredient({...newIngredient, unit_type: e.target.value})}
                    className="w-28 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="g">g</option><option value="kg">kg</option><option value="pieza">pieza</option><option value="media_pieza">½ pieza</option>
                    <option value="taza">taza</option><option value="cda">cda</option><option value="cdta">cdta</option><option value="ml">ml</option><option value="litro">litro</option>
                  </select>
                  <input type="number" placeholder="g por unidad" value={newIngredient.unit_weight_g || ""} onChange={e => setNewIngredient({...newIngredient, unit_weight_g: parseFloat(e.target.value)||1})}
                    className="w-28 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <input placeholder="Nombre descriptivo" value={newIngredient.display_unit} onChange={e => setNewIngredient({...newIngredient, display_unit: e.target.value})}
                    className="flex-1 min-w-[120px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <button onClick={addIngredient} className="bg-primary-600 text-white rounded-xl px-4 py-2 text-sm font-bold"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {ingredients.map(i => (
                    <div key={i.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 dark:bg-zinc-800/30 text-sm">
                      <span className="font-semibold flex-1">{i.ingredient_name} <span className="text-zinc-400 font-normal">({i.unit_type === 'g' ? i.quantity_per_serving_g + 'g' : Math.round(i.quantity_per_serving_g / (i.unit_weight_g || 1)) + ' ' + (i.display_unit || i.unit_type)})</span></span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">{i.ingredient_type}</span>
                      <button onClick={() => { fetch(`/api/admin/recipe-ingredients?id=${i.id}`,{method:"DELETE"}).then(() => loadSubEntities(editing.id)); }}
                        className="text-zinc-400 hover:text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ STEPS ═══ */}
            {editing && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Pasos ({steps.length})</h2>
                <div className="flex gap-2">
                  <input placeholder="Instrucción del paso..." value={newStep.instruction} onChange={e => setNewStep({...newStep, instruction: e.target.value})}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <input type="number" placeholder="Min" value={newStep.duration_min || ""} onChange={e => setNewStep({...newStep, duration_min: parseInt(e.target.value)||0})}
                    className="w-20 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <button onClick={addStep} className="bg-primary-600 text-white rounded-xl px-4 py-2 text-sm font-bold"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {steps.map((s, i) => (
                    <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/30">
                      <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                      <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{s.instruction}</p>
                      {s.duration_min ? <span className="text-xs text-zinc-500 shrink-0">{s.duration_min}min</span> : null}
                      <button onClick={() => { fetch(`/api/admin/recipe-steps?id=${s.id}`,{method:"DELETE"}).then(() => loadSubEntities(editing.id)); }}
                        className="text-zinc-400 hover:text-danger-500 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ NUTRITION FACTS ═══ */}
            {editing && (
              <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
                <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Tabla Nutricional</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { k: "protein_g", l: "Proteína (g)" }, { k: "fat_g", l: "Grasa (g)" }, { k: "carbs_g", l: "Carbs (g)" },
                    { k: "fiber_g", l: "Fibra (g)" }, { k: "moisture_g", l: "Humedad (g)" }, { k: "ash_g", l: "Ceniza (g)" },
                    { k: "calcium_mg", l: "Calcio (mg)" }, { k: "phosphorus_mg", l: "Fósforo (mg)" },
                    { k: "iron_mg", l: "Hierro (mg)" }, { k: "zinc_mg", l: "Zinc (mg)" },
                    { k: "vitamin_a_ui", l: "Vit A (UI)" }, { k: "vitamin_d_ui", l: "Vit D (UI)" },
                    { k: "vitamin_e_mg", l: "Vit E (mg)" }, { k: "omega3_g", l: "Omega 3 (g)" }, { k: "omega6_g", l: "Omega 6 (g)" },
                  ].map(({k,l}) => (
                    <div key={k}><label className="block text-[10px] font-semibold text-zinc-500 mb-1">{l}</label>
                      <input type="number" step="0.01" value={(facts as any)[k] || 0}
                        onChange={e => setFacts({...facts, [k]: parseFloat(e.target.value)||0})}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                  ))}
                </div>
                <button onClick={saveFacts} className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"><Save className="w-4 h-4" /> Guardar Nutrición</button>
              </div>
            )}
          </div>
        )}

        {/* AI Generate Modal */}
        <AIGenerateModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={(recipe) => {
            setShowNew(true);
            setEditing(null);
            handleAIGenerate(recipe);
          }}
          mode="recipe"
        />

        {/* Image Editor Modal */}
        <ImageEditor
          open={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          onSave={handleImageEditorSave}
          imageUrl={imageEditorUrl}
          circleSize={200}
          mode="square"
          cornerRadius={24}
        />
      </div>
    </AdminGuard>
  );
}
