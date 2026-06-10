"use client";

import { useMemo } from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import type { AgilitySession, Dog } from "@/types/database";

interface Props {
  sessions: AgilitySession[];
  dog: Dog;
}

const SUGGESTIONS: Array<{
  id: string;
  condition: (sessions: AgilitySession[], dog: Dog) => boolean;
  title: string;
  subtitle: string;
  action?: string;
  href?: string;
}> = [
  {
    id: "slalom-fails",
    condition: (sessions) =>
      sessions.filter((s) => s.activity_type?.toLowerCase().includes("slalom") && (s.fouls_total ?? 0) > 0).length >= 3,
    title: "Slalom problemático",
    subtitle: "Tu perro falla mucho en teleras. Practica la lección 'Slalom perfecto' en la Academia.",
    action: "Ir a Academia",
    href: "/guau/app/academia/agilidad",
  },
  {
    id: "knockdowns",
    condition: (sessions) =>
      sessions.filter((s) => (s.fouls_total ?? 0) >= 3).length >= 2,
    title: "Muchos derribos",
    subtitle: "Trabaja el impulso antes del salto. Lección: 'Control de impulso'.",
    action: "Ver lección",
    href: "/guau/app/academia/agilidad",
  },
  {
    id: "slow-speed",
    condition: (sessions) => {
      const withTime = sessions.filter((s) => (s.raw_time_seconds ?? 0) > 0);
      if (withTime.length < 3) return false;
      const avg = withTime.reduce((sum, s) => sum + (s.raw_time_seconds ?? 0), 0) / withTime.length;
      const last = withTime[0]?.raw_time_seconds ?? 0;
      return last > avg * 1.2;
    },
    title: "Velocidad bajó",
    subtitle: "Tu último tiempo fue 20% más lento que tu promedio. Prueba un circuito Jumpers.",
    action: "Iniciar Jumpers",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "no-sessions-week",
    condition: (sessions) => {
      const lastSession = sessions[0];
      if (!lastSession) return false;
      const daysSince = (Date.now() - new Date(lastSession.fecha).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    },
    title: "Extraña el entrenamiento",
    subtitle: "Hace más de 7 días sin sesión de agilidad. ¡Programa una hoy!",
    action: "Entrenar ahora",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "streak-3",
    condition: (sessions) => {
      const recent = sessions.filter((s) => {
        const daysSince = (Date.now() - new Date(s.fecha).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      return recent.length >= 3;
    },
    title: "¡Vas en racha!",
    subtitle: "3+ sesiones esta semana. Intenta un circuito estándar mañana.",
    action: "Circuito estándar",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "clean-run-ready",
    condition: (sessions) => {
      const cleanRuns = sessions.filter((s) => s.clean_run).length;
      return cleanRuns >= 2 && cleanRuns < 5;
    },
    title: "¡Listo para competir!",
    subtitle: "Ya tienes varios clean runs. Prueba un desafío de Snooker o Gamblers.",
    action: "Ver desafíos",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "few-obstacles",
    condition: (sessions) => {
      const avgObs = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.obstacles_completed_count ?? 0), 0) / sessions.length
        : 0;
      return avgObs > 0 && avgObs < 5 && sessions.length >= 3;
    },
    title: "Varía el entrenamiento",
    subtitle: "Usas pocos obstáculos. Agrega el túnel, la mesa o el balancín.",
    action: "Iniciar entrenamiento",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "repeated-fails",
    condition: (sessions) => {
      const last3 = sessions.slice(0, 3);
      return last3.length === 3 && last3.every((s) => (s.fouls_total ?? 0) > 0 && (s.fouls_total ?? 0) <= 2);
    },
    title: "Casi perfecto",
    subtitle: "Pocas faltas en las últimas sesiones. Enfócate en fluidez entre obstáculos.",
    action: "Practicar fluidez",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "long-session",
    condition: (sessions) =>
      sessions.some((s) => (s.duration_min ?? 0) > 45),
    title: "Descanso necesario",
    subtitle: "Una sesión duró más de 45 min. Descansa al perro mañana.",
    action: "Ver paseos",
    href: "/guau/app/tracker",
  },
  {
    id: "improving",
    condition: (sessions) => {
      const withTime = sessions.filter((s) => (s.net_time_seconds ?? 0) > 0);
      if (withTime.length < 4) return false;
      const firstHalf = withTime.slice(Math.floor(withTime.length / 2));
      const secondHalf = withTime.slice(0, Math.floor(withTime.length / 2));
      const avgFirst = firstHalf.reduce((s, x) => s + (x.net_time_seconds ?? 0), 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, x) => s + (x.net_time_seconds ?? 0), 0) / secondHalf.length;
      return avgSecond < avgFirst;
    },
    title: "¡Mejorando!",
    subtitle: "Tus tiempos netos están bajando. Sigue así, próxima meta: -2 segundos.",
    action: "Seguir entrenando",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "no-tunnel",
    condition: (sessions) =>
      sessions.length > 5 &&
      !sessions.some((s) =>
        s.activity_type?.toLowerCase().includes("túnel") || s.notes?.toLowerCase().includes("túnel")
      ),
    title: "Prueba el túnel",
    subtitle: "Nunca has registrado un túnel. A muchos perros les encanta.",
    action: "Iniciar entrenamiento",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "contact-faults",
    condition: (sessions) => {
      const contactSessions = sessions.filter(
        (s) =>
          (s.activity_type?.toLowerCase().includes("contacto") ||
            s.notes?.toLowerCase().includes("contacto")) &&
          (s.fouls_total ?? 0) > 0
      );
      return contactSessions.length >= 2;
    },
    title: "Refuerza contacto",
    subtitle: "Faltas en obstáculos de contacto. Practica zonas de pausa en rampa/puente.",
    action: "Lección de contacto",
    href: "/guau/app/academia/agilidad",
  },
  {
    id: "slalom-slow",
    condition: (sessions) => {
      const slalomSessions = sessions.filter(
        (s) =>
          s.activity_type?.toLowerCase().includes("slalom") &&
          (s.raw_time_seconds ?? 0) > 15
      );
      return slalomSessions.length >= 2;
    },
    title: "Slalom lento",
    subtitle: "Tu perro va lento en teleras. Empieza con 4 postes y aumenta progresivamente.",
    action: "Practicar slalom",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "streak-broken",
    condition: (sessions) => {
      const lastSession = sessions[0];
      if (!lastSession) return false;
      const daysSince = (Date.now() - new Date(lastSession.fecha).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 3 && daysSince <= 7 && sessions.length >= 5;
    },
    title: "Recupera la racha",
    subtitle: "Hace varios días sin entrenar. ¡No pasa nada! Vuelve hoy y recupera tu ritmo.",
    action: "Entrenar ahora",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "plateau",
    condition: (sessions) => {
      const withTime = sessions.filter((s) => (s.net_time_seconds ?? 0) > 0);
      if (withTime.length < 6) return false;
      const last5 = withTime.slice(0, 5);
      const times = last5.map((s) => s.net_time_seconds ?? 0);
      const maxDiff = Math.max(...times) - Math.min(...times);
      return maxDiff < 3;
    },
    title: "Rompe la meseta",
    subtitle: "5 sesiones sin mejorar tu récord. Prueba un tipo de sesión diferente.",
    action: "Nueva sesión",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "clean-but-slow",
    condition: (sessions) =>
      sessions.some((s) => s.clean_run && (s.raw_time_seconds ?? 0) > 50),
    title: "Muy limpio, pero lento",
    subtitle: "Circuito sin faltas pero lento. Ahora trabaja la velocidad con 'Gamblers'.",
    action: "Modo Gamblers",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "same-sequence",
    condition: (sessions) => {
      const types = sessions.map((s) => s.activity_type);
      const unique = [...new Set(types)];
      return sessions.length >= 5 && unique.length === 1;
    },
    title: "Cambia la rutina",
    subtitle: "Siempre usas el mismo tipo de sesión. Varía para mejorar la adaptabilidad.",
    action: "Nueva sesión",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "table-faults",
    condition: (sessions) =>
      sessions.filter((s) => s.notes?.toLowerCase().includes("mesa") && (s.fouls_total ?? 0) > 0).length >= 2,
    title: "Problema en la mesa",
    subtitle: "Practica el comando 'Espera' en la mesa antes de continuar.",
    action: "Practicar pausa",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "competition-ready",
    condition: (sessions) => {
      const cleanRuns = sessions.filter((s) => s.clean_run).length;
      const avgTime = sessions.filter((s) => (s.net_time_seconds ?? 0) > 0);
      const avg = avgTime.length > 0 ? avgTime.reduce((s, x) => s + (x.net_time_seconds ?? 0), 0) / avgTime.length : 0;
      return cleanRuns >= 5 && avg > 0 && avg < 40;
    },
    title: "¡Nivel competencia!",
    subtitle: "5+ clean runs y buenos tiempos. Considera ir a un club de agility local.",
    action: "Buscar clubs",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "relax-before",
    condition: (sessions) => {
      const last = sessions[0];
      if (!last) return false;
      return (last.duration_min ?? 0) < 10 && (last.fouls_total ?? 0) > 3;
    },
    title: "Paseo antes de entrenar",
    subtitle: "Un perro relajado rinde mejor. Sal a pasear antes de la próxima sesión.",
    action: "Iniciar paseo",
    href: "/guau/app/tracker",
  },
  {
    id: "new-obstacle",
    condition: (sessions) =>
      sessions.length >= 3 && sessions.every((s) => (s.obstacles_completed_count ?? 0) < 8),
    title: "Aumenta obstáculos",
    subtitle: "Usas pocos obstáculos por sesión. Prueba agregar 1 o 2 más cada vez.",
    action: "Iniciar entrenamiento",
    href: "/guau/app/tracker/agilidad",
  },
  {
    id: "first-session",
    condition: (sessions) => sessions.length === 1,
    title: "¡Excelente inicio!",
    subtitle: "Primera sesión registrada. Intenta entrenar 3 días esta semana.",
    action: "Planificar",
    href: "/guau/app/tracker/agilidad",
  },
];

export function TrainingAssistant({ sessions, dog }: Props) {
  const activeSuggestions = useMemo(() => {
    const matched = SUGGESTIONS.filter((s) => s.condition(sessions, dog));
    return matched.slice(0, 2);
  }, [sessions, dog]);

  if (activeSuggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-warning-500" />
        <h3 className="text-sm font-bold text-zinc-800">Sugerencias de entrenamiento</h3>
      </div>
      {activeSuggestions.map((suggestion) => (
        <a
          key={suggestion.id}
          href={suggestion.href || "#"}
          className="card-soft rounded-[1.25rem] p-4 space-y-2 bg-warning-50/40 border border-warning-100 block active:scale-[0.98] transition-transform"
        >
          <p className="text-sm font-bold text-warning-800">{suggestion.title}</p>
          <p className="text-xs text-warning-600 leading-relaxed">{suggestion.subtitle}</p>
          {suggestion.href && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-warning-700">
              {suggestion.action}
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
