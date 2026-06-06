"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    title: "¡Bienvenido a Blis Club!",
    subtitle: "Todo lo que tu perro necesita, en una sola app.",
    image: "/icons/perros%20celebrando.webp",
  },
  {
    title: "Tu perro, tu centro",
    subtitle: "Registra uno o varios perros. Controla su perfil completo.",
    image: "/icons/cards%20de%20perros.webp",
  },
  {
    title: "Nutrición inteligente",
    subtitle: "Recetario, BARF, meal plan, detox y escáner de alimentos.",
    image: "/icons/perros%20comiendo.webp",
  },
  {
    title: "Academia Canina",
    subtitle: "Entrenamiento por etapas, lecciones progresivas y streaks.",
    image: "/icons/academia%20canina.webp",
  },
  {
    title: "Salud y bienestar",
    subtitle: "Vacunas, medicamentos, veterinarios y control de peso.",
    image: "/icons/veterinario%20salud.webp",
  },
  {
    title: "Paseos y agilidad",
    subtitle: "Tracker en vivo, pipí/popo, evaluación de rutas y agilidad.",
    image: "/icons/tracker%20de%20paseo.webp",
  },
  {
    title: "Progreso de crecimiento",
    subtitle: "Seguimiento de peso, fotos y evolución de tu perro.",
    image: "/icons/progreso%20de%20crecimiento.webp",
  },
];

interface Props {
  userId: string;
  hasSeenTutorial?: boolean;
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingTutorial({ userId, hasSeenTutorial = false, forceShow = false, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const supabase = createClient();

  const shouldShow = forceShow || !hasSeenTutorial;
  if (!shouldShow) return null;

  const finish = useCallback(() => {
    setExiting(true);

    // Persist to Supabase (fire-and-forget)
    if (!hasSeenTutorial) {
      void supabase
        .from("profiles")
        .update({ has_seen_tutorial: true })
        .eq("id", userId);
    }

    // Call onComplete after animation starts
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [hasSeenTutorial, supabase, userId, onComplete]);

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [onComplete]);

  const nextStep = useCallback(() => {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  const prevStep = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta < -50 && step < SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else if (delta > 50 && step > 0) {
      setStep((s) => s - 1);
    }
    setTouchStartX(null);
  };

  const isLast = step === SLIDES.length - 1;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-300 ${exiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button (only in replay mode / forceShow) */}
      {forceShow && (
        <button
          onClick={close}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Slides container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${step * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div key={i} className="min-w-full h-full relative">
            {/* Background image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60" />

            {/* Top text */}
            <div className="absolute top-0 left-0 right-0 p-8 pt-12 text-center">
              <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-sm text-white/80 mt-2 leading-relaxed drop-shadow-md max-w-xs mx-auto">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Ir al paso ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          {/* Next / Start button */}
          <button
            onClick={nextStep}
            className="w-full flex items-center justify-center gap-2 rounded-[1.25rem] bg-white text-zinc-900 py-3.5 text-sm font-extrabold shadow-lg shadow-black/20 active:scale-[0.97] transition-transform"
          >
            {isLast ? (
              <>
                ¡Empezar! <Sparkles className="w-4 h-4 text-accent-500" />
              </>
            ) : (
              <>
                Siguiente <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back button */}
          {step > 0 && (
            <button
              onClick={prevStep}
              className="w-full flex items-center justify-center gap-2 rounded-[1.25rem] bg-white/10 backdrop-blur-md text-white py-3 text-sm font-bold active:scale-[0.97] transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
