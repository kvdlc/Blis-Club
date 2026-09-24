import { Suspense } from "react";
import { Palette } from "lucide-react";
import { KidsCatalog } from "@/components/kids/KidsCatalog";

export const dynamic = "force-dynamic";

export default function InteractivosPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-white/70" />}>
      <KidsCatalog
        categories={["colorear", "cuento"]}
        sections={["interactivo"]}
        title="Interactivos"
        subtitle="Colorea y lee directamente en la pantalla."
        icon={<Palette className="h-6 w-6" />}
      />
    </Suspense>
  );
}
