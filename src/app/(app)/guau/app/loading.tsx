export default function Loading() {
  return (
    <div className="space-y-4 px-4 pt-4 pb-24 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-zinc-200 rounded-xl" />

      {/* Card skeleton */}
      <div className="rounded-[1.5rem] bg-zinc-100 p-5 space-y-3">
        <div className="h-4 w-32 bg-zinc-200 rounded-lg" />
        <div className="h-12 w-24 bg-zinc-200 rounded-xl" />
        <div className="h-3 w-48 bg-zinc-200 rounded-lg" />
      </div>

      {/* Rows skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[1.25rem] bg-zinc-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-200" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-3/4 bg-zinc-200 rounded-lg" />
            <div className="h-2 w-1/2 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
