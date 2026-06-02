"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "blis_disabled_vaccines";

function loadDisabled(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persist(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* noop */ }
}

export function useDisabledVaccines() {
  const [disabledIds, setDisabledIds] = useState<Set<string>>(() => new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDisabledIds(loadDisabled());
    setMounted(true);
    const onStorage = () => setDisabledIds(loadDisabled());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = (id: string) => {
    setDisabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  };

  const isEnabled = (id: string) => !disabledIds.has(id);

  return { disabledIds, toggle, isEnabled, mounted };
}
