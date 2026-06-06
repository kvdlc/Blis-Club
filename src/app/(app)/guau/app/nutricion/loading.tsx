export default function Loading() {
  return (
    <div className="space-y-4 px-4 pt-4 pb-24 animate-pulse">
      <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      <div className="rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-800/60 p-5 space-y-4">
        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
          ))}
        </div>
        <div className="flex justify-center py-4">
          <div className="w-40 h-40 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
      </div>
    </div>
  );
}
