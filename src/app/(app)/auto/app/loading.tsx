export default function AutoLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-auto-500 animate-spin" />
        <p className="text-sm text-zinc-400">Cargando...</p>
      </div>
    </div>
  );
}
