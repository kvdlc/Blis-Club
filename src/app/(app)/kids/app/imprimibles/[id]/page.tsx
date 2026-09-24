import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintableSheet, type Printable } from "@/components/kids/PrintableSheet";
import { PrintButton } from "./PrintButtons";
import { DownloadPdfButton, OpenPdfLink } from "@/components/kids/DownloadPdfButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrintableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data } = await supabase
    .from("kids_printables")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const printable = data as Printable;

  return (
    <div className="space-y-4">
      <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/kids/app/imprimibles"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-transform active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-kids-600">Imprimible</p>
            <h1 className="truncate text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
              {printable.title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DownloadPdfButton
            url={`/api/kids/printable-pdf/${printable.id}`}
            filename={printable.title}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          />
          <OpenPdfLink url={`/api/kids/printable-pdf/${printable.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md" />
          <PrintButton />
        </div>
      </div>

      <PrintableSheet printable={printable} />

      <p className="text-center text-xs font-semibold text-zinc-400 print:hidden">
        Consejo: en el diálogo de impresión elige «Guardar como PDF» para tenerlo en tu dispositivo.
      </p>
    </div>
  );
}
