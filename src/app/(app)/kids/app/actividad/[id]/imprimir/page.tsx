import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookPrintSheet } from "@/components/kids/BookPrintSheet";
import { PrintBookButton } from "./PrintBookButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: activity } = await supabase.from("kids_activities").select("*").eq("id", id).maybeSingle();
  if (!activity) notFound();

  return (
    <div className="space-y-4">
      <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/kids/app/actividad/${id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-kids-600">Listo para imprimir</p>
            <h1 className="text-sm font-black text-zinc-800">{activity.title}</h1>
          </div>
        </div>
        <PrintBookButton autoPrint={sp.auto === "1"} />
      </div>

      <BookPrintSheet activity={activity as any} />

      <p className="text-center text-xs font-semibold text-zinc-400 print:hidden">
        En el diálogo de impresión elige «Guardar como PDF» para tenerlo en tu dispositivo.
      </p>
    </div>
  );
}
