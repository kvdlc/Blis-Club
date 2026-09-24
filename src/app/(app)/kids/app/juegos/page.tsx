import { Suspense } from "react";
import { Puzzle } from "lucide-react";
import { KidsCatalog } from "@/components/kids/KidsCatalog";

export const dynamic = "force-dynamic";

export default function JuegosPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-white/70" />}>
      <KidsCatalog
        categories={["crucigrama", "sopa_letras", "laberinto", "unir_puntos"]}
        sections={["juego"]}
        title="Juegos"
        subtitle="Puzzles y retos para pensar y divertirse."
        icon={<Puzzle className="h-6 w-6" />}
      />
    </Suspense>
  );
}
