"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { API_CATALOG, getAllFieldIds } from "@/lib/api-catalog";
import type { ApiKeyValue } from "@/types/api-cloud";

function useLocalStorageSet(key: string): [Set<string>, React.Dispatch<React.SetStateAction<Set<string>>>] {
  const [state, setState] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(key);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(Array.from(state)));
    }
  }, [key, state]);

  return [state, setState];
}

function useLocalStorageRecord(key: string): [Record<string, string>, React.Dispatch<React.SetStateAction<Record<string, string>>>] {
  const [state, setState] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

export function useApiConfig() {
  const [apiValues, setApiValues] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({});
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, "untested" | "testing" | "success" | "error" | "limit">>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingApp, setIsSavingApp] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [favorites, setFavorites] = useLocalStorageSet("api_favorites");
  const [expandedCategories, setExpandedCategories] = useLocalStorageSet("api_expanded_categories");
  const [expandedApps, setExpandedApps] = useLocalStorageSet("api_expanded_apps");
  const [notes, setNotes] = useLocalStorageRecord("api_notes");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const allFieldIds = useMemo(() => getAllFieldIds(), []);

  const loadKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys");
      const json = await res.json();
      const rows: ApiKeyValue[] = json.data || [];

      const values: Record<string, string> = {};
      const updated: Record<string, string> = {};
      for (const row of rows) {
        values[row.key_name] = row.key_value;
        if (row.updated_at) updated[row.key_name] = row.updated_at;
      }

      setApiValues(values);
      setLastUpdated(updated);

      const statuses: Record<string, "untested" | "testing" | "success" | "error" | "limit"> = {};
      for (const id of allFieldIds) {
        statuses[id] = values[id] ? "untested" : "untested";
      }
      setFieldStatuses(statuses);
    } catch (err) {
      console.error("Error loading API keys:", err);
    } finally {
      setIsLoading(false);
    }
  }, [allFieldIds]);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const handleValueChange = useCallback((fieldId: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const getValue = useCallback(
    (fieldId: string) => {
      if (draftValues[fieldId] !== undefined) return draftValues[fieldId];
      return apiValues[fieldId] || "";
    },
    [draftValues, apiValues]
  );

  const hasChanges = useCallback(
    (appId: string) => {
      for (const cat of API_CATALOG) {
        for (const app of cat.apps) {
          if (app.id !== appId) continue;
          for (const field of app.fields) {
            if (draftValues[field.id] !== undefined && draftValues[field.id] !== apiValues[field.id]) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [draftValues, apiValues]
  );

  const hasAnyChanges = useMemo(() => {
    return Object.keys(draftValues).some(
      (id) => draftValues[id] !== apiValues[id]
    );
  }, [draftValues, apiValues]);

  const handleSaveApp = useCallback(async (appId: string) => {
    setIsSavingApp(appId);
    try {
      const payload: Record<string, string> = {};
      for (const cat of API_CATALOG) {
        for (const app of cat.apps) {
          if (app.id !== appId) continue;
          for (const field of app.fields) {
            const val = draftValues[field.id];
            if (val !== undefined) payload[field.id] = val;
          }
        }
      }

      const res = await fetch("/api/admin/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: payload }),
      });

      if (res.ok) {
        setApiValues((prev) => ({ ...prev, ...payload }));
        setDraftValues((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(payload)) delete next[k];
          return next;
        });
        const now = new Date().toISOString();
        setLastUpdated((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(payload)) next[k] = now;
          return next;
        });
      }
    } finally {
      setIsSavingApp(null);
    }
  }, [draftValues]);

  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const [id, val] of Object.entries(draftValues)) {
        if (val !== apiValues[id]) payload[id] = val;
      }

      const res = await fetch("/api/admin/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: payload }),
      });

      if (res.ok) {
        setApiValues((prev) => ({ ...prev, ...payload }));
        setDraftValues({});
        const now = new Date().toISOString();
        setLastUpdated((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(payload)) next[k] = now;
          return next;
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [draftValues, apiValues]);

  const testConnection = useCallback(async (fieldId: string) => {
    setFieldStatuses((prev) => ({ ...prev, [fieldId]: "testing" }));
    try {
      const value = getValue(fieldId);
      const res = await fetch("/api/admin/api-keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, value }),
      });
      const json = await res.json();
      setFieldStatuses((prev) => ({
        ...prev,
        [fieldId]: json.valid ? "success" : json.limit ? "limit" : "error",
      }));
      return json;
    } catch {
      setFieldStatuses((prev) => ({ ...prev, [fieldId]: "error" }));
      return { valid: false, error: "Error de conexión" };
    }
  }, [getValue]);

  const testApp = useCallback(async (appId: string) => {
    const results: Record<string, { valid: boolean; error?: string }> = {};
    for (const cat of API_CATALOG) {
      for (const app of cat.apps) {
        if (app.id !== appId) continue;
        for (const field of app.fields) {
          const result = await testConnection(field.id);
          results[field.id] = result;
        }
      }
    }
    return results;
  }, [testConnection]);

  const copyToClipboard = useCallback(async (fieldId: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys/value?key=${encodeURIComponent(fieldId)}`);
      const json = await res.json();
      await navigator.clipboard.writeText(json.value || "");
      setCopiedId(fieldId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error("Error copying value");
    }
  }, []);

  const toggleFavorite = useCallback((appId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  }, [setFavorites]);

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, [setExpandedCategories]);

  const toggleApp = useCallback((appId: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  }, [setExpandedApps]);

  const handleNoteChange = useCallback((appId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [appId]: note }));
  }, [setNotes]);

  const exportConfig = useCallback(() => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      values: apiValues,
      notes,
      favorites: Array.from(favorites),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blis-api-keys-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [apiValues, notes, favorites]);

  const importConfig = useCallback(async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.values) {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(data.values)) {
        if (typeof v === "string") payload[k] = v;
      }
      const res = await fetch("/api/admin/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: payload }),
      });
      if (res.ok) {
        setApiValues((prev) => ({ ...prev, ...payload }));
        if (data.notes) setNotes(data.notes);
        if (data.favorites) setFavorites(new Set(data.favorites));
        await loadKeys();
      }
    }
  }, [loadKeys, setNotes, setFavorites]);

  const configuredCount = useMemo(() => {
    return allFieldIds.filter((id) => !!getValue(id)).length;
  }, [allFieldIds, getValue]);

  const activeCount = useMemo(() => {
    return Object.values(fieldStatuses).filter((s) => s === "success").length;
  }, [fieldStatuses]);

  const errorCount = useMemo(() => {
    return Object.values(fieldStatuses).filter((s) => s === "error").length;
  }, [fieldStatuses]);

  const limitCount = useMemo(() => {
    return Object.values(fieldStatuses).filter((s) => s === "limit").length;
  }, [fieldStatuses]);

  return {
    apiValues,
    draftValues,
    lastUpdated,
    fieldStatuses,
    favorites,
    expandedCategories,
    expandedApps,
    notes,
    isLoading,
    isSaving,
    isSavingApp,
    copiedId,
    configuredCount,
    activeCount,
    errorCount,
    limitCount,
    totalFields: allFieldIds.length,
    totalFavorites: favorites.size,
    getValue,
    hasChanges,
    hasAnyChanges,
    handleValueChange,
    handleSaveApp,
    handleSaveAll,
    testConnection,
    testApp,
    copyToClipboard,
    toggleFavorite,
    toggleCategory,
    toggleApp,
    handleNoteChange,
    exportConfig,
    importConfig,
    loadKeys,
  };
}
