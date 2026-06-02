"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse">
        <span className="w-4 h-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-all hover:scale-105 active:scale-95"
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
