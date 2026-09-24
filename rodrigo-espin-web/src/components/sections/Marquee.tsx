import { marqueeItems } from "@/data/campaign";

export function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="border-y border-ink/10 bg-ink text-white">
      <div className="relative flex overflow-hidden py-4">
        <div className="flex w-max animate-marquee items-center">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center whitespace-nowrap">
              <span className="px-6 font-display text-sm font-bold uppercase tracking-[0.14em] text-white/85">
                {item}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
