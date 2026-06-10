"use client";

import { useState, useEffect, createElement } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  Plus, Edit, Trash2, GraduationCap, Save, X,
  ChevronDown, ChevronRight, BookOpen, Layers,
  Pencil, FileText, Timer, Zap, BookMarked, Sparkles
} from "lucide-react";
import LessonContentEditor from "@/components/admin/LessonContentEditor";
import AIGenerateModal from "@/components/admin/AIGenerateModal";

interface Stage {
  id: string;
  title: string;
  description: string;
  color_hex: string;
  order: number;
}

interface Module {
  id: string;
  stage_id: string;
  title: string;
  description: string;
  order: number;
  icon_name: string;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  order: number;
  content_json: any;
  video_url: string | null;
}

interface StageForm {
  title: string;
  description: string;
  color_hex: string;
  order: number;
}

interface ModuleForm {
  stageId: string;
  editingId?: string;
  title: string;
  description: string;
  icon_name: string;
  order: number;
}

interface LessonForm {
  moduleId: string;
  editingId?: string;
  title: string;
  type: string;
  order: number;
  content_json: any;
  video_url: string;
}

const STAGE_COLORS = ["#5956E9", "#209F89", "#F97316", "#EF4444", "#A855F7", "#3B82F6", "#EC4899", "#14B8A6"];
const LESSON_TYPES = [
  { value: "theory", label: "Teoría", icon: BookOpen },
  { value: "minigame_reflejos", label: "Minijuego Reflejos", icon: Zap },
  { value: "minigame_diccionario", label: "Minijuego Diccionario", icon: BookMarked },
  { value: "practice_timer", label: "Temporizador de Práctica", icon: Timer },
  { value: "quiz", label: "Quiz", icon: FileText },
];

function getLessonTypeLabel(type: string) {
  const t = LESSON_TYPES.find((lt) => lt.value === type);
  return t ? t.label : type;
}

export default function AcademiaPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const [stageForm, setStageForm] = useState<StageForm | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const [moduleForm, setModuleForm] = useState<ModuleForm | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm | null>(null);
  const [showLessonAIModal, setShowLessonAIModal] = useState(false);

  const appSlug = typeof window !== "undefined" ? (localStorage.getItem("blis_active_app_slug") || "guau") : "guau";

  const resolveAppId = async (): Promise<string | null> => {
    const appsRes = await fetch("/api/admin/applications");
    const appsJson = await appsRes.json();
    const app = appsJson.data?.find((a: any) => a.slug === appSlug);
    return app?.id || null;
  };

  const loadStages = async () => {
    const res = await fetch(`/api/admin/stages?app=${appSlug}`);
    const json = await res.json();
    setStages(json.data || []);
  };

  const loadModules = async () => {
    const res = await fetch("/api/admin/modules");
    const json = await res.json();
    setModules(json.data || []);
  };

  const loadLessons = async (moduleId: string) => {
    const res = await fetch(`/api/admin/lessons?module_id=${moduleId}`);
    const json = await res.json();
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: json.data || [] }));
  };

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      await Promise.all([loadStages(), loadModules()]);
    } catch {
      setLoadError("Error al cargar datos");
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const getModulesForStage = (stageId: string) =>
    modules.filter((m) => m.stage_id === stageId);

  const getLessonsForModule = (moduleId: string) =>
    lessonsByModule[moduleId] || [];

  // ---- STAGE CRUD ----

  const handleCreateStage = () => {
    setEditingStage(null);
    setStageForm({ title: "", description: "", color_hex: "#5956E9", order: stages.length });
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStageForm({
      title: stage.title,
      description: stage.description || "",
      color_hex: stage.color_hex,
      order: stage.order,
    });
  };

  const handleSaveStage = async () => {
    if (!stageForm) return;
    const appId = await resolveAppId();
    if (!appId) return;

    if (editingStage) {
      await fetch("/api/admin/stages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingStage.id, ...stageForm }),
      });
    } else {
      await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...stageForm, application_id: appId }),
      });
    }
    setStageForm(null);
    setEditingStage(null);
    await loadStages();
  };

  const handleDeleteStage = async (id: string) => {
    if (!confirm("¿Eliminar esta etapa y todos sus módulos y lecciones?")) return;
    await fetch(`/api/admin/stages?id=${id}`, { method: "DELETE" });
    setExpandedStage((prev) => (prev === id ? null : prev));
    await loadStages();
    await loadModules();
  };

  const toggleStageExpand = (stageId: string) => {
    setExpandedStage((prev) => (prev === stageId ? null : stageId));
    setExpandedModule(null);
    setModuleForm(null);
    setLessonForm(null);
  };

  // ---- MODULE CRUD ----

  const handleCreateModule = (stageId: string) => {
    const modulesCount = getModulesForStage(stageId).length;
    setModuleForm({
      stageId,
      title: "",
      description: "",
      icon_name: "BookOpen",
      order: modulesCount,
    });
  };

  const handleEditModule = (mod: Module) => {
    setModuleForm({
      stageId: mod.stage_id,
      editingId: mod.id,
      title: mod.title,
      description: mod.description || "",
      icon_name: mod.icon_name || "BookOpen",
      order: mod.order,
    });
  };

  const handleSaveModule = async () => {
    if (!moduleForm) return;
    if (moduleForm.editingId) {
      await fetch("/api/admin/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: moduleForm.editingId,
          title: moduleForm.title,
          description: moduleForm.description,
          icon_name: moduleForm.icon_name,
          order: moduleForm.order,
        }),
      });
    } else {
      await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage_id: moduleForm.stageId,
          title: moduleForm.title,
          description: moduleForm.description,
          icon_name: moduleForm.icon_name,
          order: moduleForm.order,
        }),
      });
    }
    setModuleForm(null);
    await loadModules();
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("¿Eliminar este módulo y sus lecciones?")) return;
    await fetch(`/api/admin/modules?id=${id}`, { method: "DELETE" });
    setExpandedModule((prev) => (prev === id ? null : prev));
    await loadModules();
  };

  const toggleModuleExpand = async (modId: string) => {
    if (expandedModule === modId) {
      setExpandedModule(null);
      setLessonForm(null);
    } else {
      setExpandedModule(modId);
      if (!lessonsByModule[modId]) await loadLessons(modId);
      setLessonForm(null);
    }
  };

  // ---- LESSON CRUD ----

  const handleCreateLesson = (moduleId: string) => {
    const lessonsCount = getLessonsForModule(moduleId).length;
    setLessonForm({
      moduleId,
      title: "",
      type: "theory",
      order: lessonsCount,
      content_json: defaultContentForType("theory"),
      video_url: "",
    });
  };

  const handleEditLesson = (lesson: Lesson) => {
    setLessonForm({
      moduleId: lesson.module_id,
      editingId: lesson.id,
      title: lesson.title,
      type: lesson.type,
      order: lesson.order,
      content_json: lesson.content_json || defaultContentForType(lesson.type),
      video_url: lesson.video_url || "",
    });
  };

  const handleSaveLesson = async () => {
    if (!lessonForm) return;

    if (lessonForm.editingId) {
      await fetch("/api/admin/lessons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lessonForm.editingId,
          title: lessonForm.title,
          type: lessonForm.type,
          order: lessonForm.order,
          content_json: lessonForm.content_json,
          video_url: lessonForm.video_url || null,
        }),
      });
    } else {
      await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: lessonForm.moduleId,
          title: lessonForm.title,
          type: lessonForm.type,
          order: lessonForm.order,
          content_json: lessonForm.content_json,
          video_url: lessonForm.video_url || null,
        }),
      });
    }
    setLessonForm(null);
    await loadLessons(lessonForm.moduleId);
  };

  const handleDeleteLesson = async (id: string, moduleId: string) => {
    if (!confirm("¿Eliminar esta lección?")) return;
    await fetch(`/api/admin/lessons?id=${id}`, { method: "DELETE" });
    await loadLessons(moduleId);
  };

  const handleLessonTypeChange = (type: string) => {
    if (!lessonForm) return;
    setLessonForm({
      ...lessonForm,
      type,
      content_json: defaultContentForType(type),
    });
  };

  // ---- HELPERS ----

  function iconForModule(iconName: string) {
    const icons: Record<string, any> = {
      BookOpen, BookMarked, FileText, Zap, Layers, GraduationCap, Pencil, Timer,
    };
    return icons[iconName] || BookOpen;
  }

  function defaultContentForType(type: string): any {
    switch (type) {
      case "theory":
        return { cards: [{ title: "", body: "", image: "" }] };
      case "minigame_reflejos":
        return { timings: [{ label: "Rápido", seconds: 10 }, { label: "Normal", seconds: 15 }] };
      case "minigame_diccionario":
        return { pairs: [{ word: "", definition: "" }] };
      case "practice_timer":
        return { duration_seconds: 60, instructions: "" };
      case "quiz":
        return { questions: [{ question: "", options: ["", "", "", ""], correct_index: 0 }] };
      default:
        return {};
    }
  }

  // If lessonForm is open, render its editor as a modal overlay instead of inline
  // to avoid nesting issues with the tree layout.

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Academia</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Gestiona etapas, módulos y lecciones
            </p>
          </div>
          <button
            onClick={handleCreateStage}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Etapa
          </button>
        </div>

        {/* STAGE FORM */}
        {stageForm && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">
                {editingStage ? "Editar Etapa" : "Nueva Etapa"}
              </h2>
              <button
                onClick={() => { setStageForm(null); setEditingStage(null); }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                  Título
                </label>
                <input
                  value={stageForm.title}
                  onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                  Orden
                </label>
                <input
                  type="number"
                  value={stageForm.order}
                  onChange={(e) => setStageForm({ ...stageForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Descripción
              </label>
              <textarea
                value={stageForm.description}
                onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Color
              </label>
              <div className="flex gap-2">
                {STAGE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStageForm({ ...stageForm, color_hex: c })}
                    className={`w-9 h-9 rounded-xl transition-all ${ stageForm.color_hex === c ? "ring-2 ring-offset-2 ring-primary-500 scale-110" : "" }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveStage}
                className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <Save className="w-4 h-4" /> {editingStage ? "Actualizar" : "Crear"}
              </button>
              <button
                onClick={() => { setStageForm(null); setEditingStage(null); }}
                className="flex items-center gap-2 border border-zinc-200 text-zinc-600 rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LOADING / ERROR */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : loadError ? (
          <div className="text-center py-12 text-red-500">{loadError}</div>
        ) : stages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No hay etapas. Crea la primera con el botón &quot;Nueva Etapa&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => {
              const stageModules = getModulesForStage(stage.id);
              const isExpanded = expandedStage === stage.id;

              return (
                <div key={stage.id}>
                  {/* STAGE CARD */}
                  <div
                    onClick={() => toggleStageExpand(stage.id)}
                    className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                  >
                    <button className="text-zinc-400" onClick={(e) => { e.stopPropagation(); toggleStageExpand(stage.id); }}>
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: stage.color_hex }}
                    >
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-zinc-800">{stage.title}</p>
                      <p className="text-sm text-zinc-500 truncate">{stage.description || "Sin descripción"}</p>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono shrink-0">#{stage.order}</span>
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditStage(stage)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED: MODULES */}
                  {isExpanded && (
                    <div className="ml-8 mt-2 space-y-2 border-l-2 border-zinc-200 pl-4">
                      {stageModules.length === 0 && !moduleForm && (
                        <p className="text-sm text-zinc-400 py-2">No hay módulos en esta etapa.</p>
                      )}

                      {stageModules.map((mod) => {
                        const modLessons = getLessonsForModule(mod.id);
                        const isModExpanded = expandedModule === mod.id;
                        const ModIcon = iconForModule(mod.icon_name);

                        return (
                          <div key={mod.id}>
                            {/* MODULE CARD */}
                            <div
                              onClick={() => toggleModuleExpand(mod.id)}
                              className="card-soft rounded-[1.25rem] p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
                            >
                              <button className="text-zinc-400" onClick={(e) => { e.stopPropagation(); toggleModuleExpand(mod.id); }}>
                                {isModExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                <ModIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-800">{mod.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{mod.description || "Sin descripción"}</p>
                              </div>
                              <span className="text-xs text-zinc-400 font-mono shrink-0">#{mod.order}</span>
                              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleEditModule(mod)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(mod.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* EXPANDED: LESSONS */}
                            {isModExpanded && (
                              <div className="ml-6 mt-2 space-y-2 border-l-2 border-zinc-200 pl-4">
                                {modLessons.length === 0 && (
                                  <p className="text-sm text-zinc-400 py-2">No hay lecciones en este módulo.</p>
                                )}

                                {modLessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="card-soft rounded-[1.25rem] p-3 flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                                      {createElement(getLessonTypeIcon(lesson.type), { className: "w-4 h-4" })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-zinc-800">{lesson.title}</p>
                                      <p className="text-xs text-zinc-500">{getLessonTypeLabel(lesson.type)}</p>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-mono shrink-0">#{lesson.order}</span>
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        onClick={() => handleEditLesson(lesson)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLesson(lesson.id, lesson.module_id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* ADD LESSON BUTTON */}
                                <button
                                  onClick={() => handleCreateLesson(mod.id)}
                                  className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 py-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Agregar lección
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* MODULE FORM */}
                      {moduleForm && moduleForm.stageId === stage.id && (
                        <div className="card-soft rounded-[1.25rem] p-4 space-y-3 border border-primary-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-800">
                              {moduleForm.editingId ? "Editar Módulo" : "Nuevo Módulo"}
                            </h3>
                            <button onClick={() => setModuleForm(null)} className="text-zinc-400 hover:text-zinc-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-600 mb-1">Título</label>
                              <input
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-600 mb-1">Orden</label>
                              <input
                                type="number"
                                value={moduleForm.order}
                                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1">Descripción</label>
                            <textarea
                              value={moduleForm.description}
                              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                              rows={1}
                              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1">Icono</label>
                            <select
                              value={moduleForm.icon_name}
                              onChange={(e) => setModuleForm({ ...moduleForm, icon_name: e.target.value })}
                              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="BookOpen">BookOpen</option>
                              <option value="BookMarked">BookMarked</option>
                              <option value="FileText">FileText</option>
                              <option value="Zap">Zap</option>
                              <option value="Layers">Layers</option>
                              <option value="GraduationCap">GraduationCap</option>
                              <option value="Pencil">Pencil</option>
                              <option value="Timer">Timer</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveModule}
                              className="flex items-center gap-1 bg-primary-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
                            >
                              <Save className="w-3.5 h-3.5" /> {moduleForm.editingId ? "Actualizar" : "Crear"}
                            </button>
                            <button
                              onClick={() => setModuleForm(null)}
                              className="flex items-center gap-1 border border-zinc-200 text-zinc-600 rounded-xl px-4 py-2 text-xs font-bold hover:bg-zinc-50 transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ADD MODULE BUTTON */}
                      {(!moduleForm || moduleForm.stageId !== stage.id) && (
                        <button
                          onClick={() => handleCreateModule(stage.id)}
                          className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 py-1"
                        >
                          <Plus className="w-4 h-4" /> Agregar módulo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LESSON FORM — renders as a sticky bottom sheet / modal so it doesn't nest inside collapsed tree */}
        {lessonForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setLessonForm(null)}>
            <div
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[1.25rem] sm:rounded-[1.25rem] p-6 space-y-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-800">
                  {lessonForm.editingId ? "Editar Lección" : "Nueva Lección"}
                </h2>
                <button onClick={() => setLessonForm(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Título</label>
                  <input
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Tipo de Lección</label>
                <div className="flex flex-wrap gap-2">
                  {LESSON_TYPES.map((lt) => {
                    const LIcon = lt.icon;
                    return (
                      <button
                        key={lt.value}
                        onClick={() => handleLessonTypeChange(lt.value)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${ lessonForm.type === lt.value ? "bg-primary-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200" }`}
                      >
                        <LIcon className="w-3.5 h-3.5" />
                        {lt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <LessonContentEditor
                type={lessonForm.type}
                value={lessonForm.content_json}
                onChange={(val) => setLessonForm({ ...lessonForm, content_json: val })}
                videoUrl={lessonForm.video_url}
                onVideoUrlChange={(url) => setLessonForm({ ...lessonForm, video_url: url })}
              />

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSaveLesson}
                  className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
                >
                  <Save className="w-4 h-4" /> {lessonForm.editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  onClick={() => setShowLessonAIModal(true)}
                  className="flex items-center gap-2 bg-accent-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-accent-700 active:scale-[0.97] transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Generar con AI
                </button>
                <button
                  onClick={() => setLessonForm(null)}
                  className="flex items-center gap-2 border border-zinc-200 text-zinc-600 rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Lesson Generate Modal */}
      {lessonForm && (
        <AIGenerateModal
          isOpen={showLessonAIModal}
          onClose={() => setShowLessonAIModal(false)}
          onGenerate={(content_json) => {
            setLessonForm({ ...lessonForm, content_json });
            setShowLessonAIModal(false);
          }}
          mode="lesson"
          lessonType={lessonForm.type}
          moduleTitle={modules.find(m => m.id === lessonForm.moduleId)?.title || "General"}
        />
      )}
    </AdminGuard>
  );
}

function getLessonTypeIcon(type: string) {
  const t = LESSON_TYPES.find((lt) => lt.value === type);
  return t ? t.icon : FileText;
}
